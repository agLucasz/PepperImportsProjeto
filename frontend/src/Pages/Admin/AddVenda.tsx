import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Plus, Minus,
  X, CheckCircle, Trash2, ShoppingBag, ArrowLeft,
} from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import { getAll as getProdutos, imageUrl, TAMANHOS, type ProdutoDTO } from '../../Services/produtoService';
import { create, type VendaItemCreateDTO } from '../../Services/vendaService';
import '../../Styles/Admin/venda.css';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface CartItem {
  produto: ProdutoDTO;
  tamanho: number;
  quantidade: number;
}

const cartKey = (produtoId: number, tamanho: number) => `${produtoId}:${tamanho}`;

/** Estado do picker de quantidade */
interface QtyPickerState {
  produto: ProdutoDTO;
  tamanho: number;
  estoqueDisp: number;
}

const AddVenda: React.FC = () => {
  const navigate   = useNavigate();
  const searchRef  = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const [produtos,    setProdutos]    = useState<ProdutoDTO[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState<string | null>(null);
  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [finalizando, setFinalizando] = useState(false);
  const [sucesso,     setSucesso]     = useState(false);
  const [erro,        setErro]        = useState('');

  /** Picker de tamanho (quando o produto tem múltiplos tamanhos) */
  const [tamPicker, setTamPicker] = useState<ProdutoDTO | null>(null);

  /** Picker de quantidade — aparece sempre após o tamanho ser escolhido */
  const [qtyPicker, setQtyPicker]   = useState<QtyPickerState | null>(null);
  const [qtyInput,  setQtyInput]    = useState(1);

  useEffect(() => {
    (async () => {
      try { setProdutos(await getProdutos()); }
      catch { /* silently ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') { setTamPicker(null); setQtyPicker(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Foca no input quando o picker de quantidade abre */
  useEffect(() => {
    if (qtyPicker) {
      setQtyInput(1);
      setTimeout(() => qtyInputRef.current?.select(), 60);
    }
  }, [qtyPicker]);

  const allCats = Array.from(new Set(produtos.flatMap(p => p.categorias))).sort();

  const filtered = produtos.filter(p => {
    if (!p.ativo) return false;
    const matchSearch = p.nomeProduto.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter ? p.categorias.includes(catFilter) : true;
    return matchSearch && matchCat;
  });

  /** Clique no card: abre picker de tamanho (se necessário) ou vai direto p/ qty */
  const handleCardClick = (produto: ProdutoDTO) => {
    const disponiveis = produto.estoques.filter(e => e.quantidade > 0);
    if (disponiveis.length === 0) return;
    if (disponiveis.length === 1) {
      openQtyPicker(produto, disponiveis[0].tamanho);
    } else {
      setTamPicker(produto);
    }
  };

  /** Abre o picker de quantidade para o produto + tamanho escolhido */
  const openQtyPicker = (produto: ProdutoDTO, tamanho: number) => {
    setTamPicker(null);
    const estoqueDisp = produto.estoques.find(e => e.tamanho === tamanho)?.quantidade ?? 0;
    setQtyPicker({ produto, tamanho, estoqueDisp });
  };

  /** Confirma a quantidade e adiciona ao carrinho */
  const confirmQty = () => {
    if (!qtyPicker) return;
    const { produto, tamanho, estoqueDisp } = qtyPicker;
    const qty = Math.min(Math.max(1, qtyInput), estoqueDisp);
    setCart(prev => {
      const key      = cartKey(produto.produtoId, tamanho);
      const existing = prev.find(c => cartKey(c.produto.produtoId, c.tamanho) === key);
      if (existing) {
        const novaQty = Math.min(existing.quantidade + qty, estoqueDisp);
        return prev.map(c =>
          cartKey(c.produto.produtoId, c.tamanho) === key
            ? { ...c, quantidade: novaQty }
            : c
        );
      }
      return [...prev, { produto, tamanho, quantidade: qty }];
    });
    setQtyPicker(null);
  };

  const updateQty = (produtoId: number, tamanho: number, delta: number) => {
    const key = cartKey(produtoId, tamanho);
    setCart(prev =>
      prev
        .map(c => cartKey(c.produto.produtoId, c.tamanho) === key
          ? { ...c, quantidade: c.quantidade + delta }
          : c
        )
        .filter(c => c.quantidade > 0)
    );
  };

  const removeFromCart = (produtoId: number, tamanho: number) => {
    setCart(prev => prev.filter(c => cartKey(c.produto.produtoId, c.tamanho) !== cartKey(produtoId, tamanho)));
  };

  const clearCart = () => setCart([]);

  const subtotal   = cart.reduce((acc, c) => acc + c.produto.valorVenda * c.quantidade, 0);
  const totalItems = cart.reduce((acc, c) => acc + c.quantidade, 0);

  const handleFinalizar = async () => {
    if (cart.length === 0) return;
    setFinalizando(true);
    setErro('');
    try {
      const itens: VendaItemCreateDTO[] = cart.map(c => ({
        produtoId:     c.produto.produtoId,
        tamanho:       c.tamanho,
        quantidadeItem: c.quantidade,
        valorItem:     c.produto.valorVenda,
      }));
      await create({ itens });
      setSucesso(true);
      setCart([]);
      const prods = await getProdutos();
      setProdutos(prods);
      setTimeout(() => setSucesso(false), 3500);
    } catch {
      setErro('Erro ao finalizar venda. Tente novamente.');
    } finally {
      setFinalizando(false);
    }
  };

  const cartQtyTotal = (produtoId: number) =>
    cart.filter(c => c.produto.produtoId === produtoId).reduce((s, c) => s + c.quantidade, 0);

  return (
    <div className="admin-shell">
      <SideBar />

      <main className="main">
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/pdv')}>Vendas</span>
            <span className="sep">/</span>
            <b>Nova Venda</b>
          </div>
        </div>

        <div className="page">
          <button className="page-back" onClick={() => navigate('/pdv')}>
            <ArrowLeft size={14} strokeWidth={2} />
            Voltar para Vendas
          </button>

          <div className="pdv-shell">
            {/* ========= LEFT: Produtos ========= */}
            <div className="pdv-left">
              <div className="pdv-search">
                <Search size={18} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  ref={searchRef}
                  placeholder="Buscar produto ou categoria…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <kbd>⌘K</kbd>
              </div>

              {allCats.length > 0 && (
                <div className="pdv-cats">
                  <button
                    className={`chip${catFilter === null ? ' active' : ''}`}
                    onClick={() => setCatFilter(null)}
                  >
                    Todos
                  </button>
                  {allCats.map(cat => (
                    <button
                      key={cat}
                      className={`chip${catFilter === cat ? ' active' : ''}`}
                      onClick={() => setCatFilter(cat === catFilter ? null : cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <p style={{ color: 'var(--fg-mute)', fontSize: 13, padding: '24px 0' }}>
                  Carregando produtos…
                </p>
              ) : filtered.length === 0 ? (
                <p style={{ color: 'var(--fg-soft)', fontSize: 13, padding: '24px 0' }}>
                  Nenhum produto encontrado.
                </p>
              ) : (
                <div className="pdv-grid">
                  {filtered.map(prod => {
                    const inCart     = cartQtyTotal(prod.produtoId);
                    const semEstoque = prod.quantidadeTotal === 0;
                    return (
                      <div
                        key={prod.produtoId}
                        className={`pdv-card${semEstoque ? ' out-of-stock' : ''}`}
                        onClick={() => !semEstoque && handleCardClick(prod)}
                      >
                        <div className="pdv-card-img">
                          {prod.imagemUrls.length > 0 ? (
                            <img
                              src={imageUrl(prod.imagemUrls[0])}
                              alt={prod.nomeProduto}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ShoppingBag size={32} strokeWidth={1.2} color="var(--fg-soft)" />
                          )}
                          <span className="pdv-card-stock">
                            {semEstoque ? 'Esgotado' : `${prod.quantidadeTotal} un`}
                          </span>
                          {inCart > 0 && (
                            <span className="pdv-card-in-cart">{inCart}</span>
                          )}
                        </div>
                        <div className="pdv-card-info">
                          {prod.categorias.length > 0 && (
                            <small>{prod.categorias[0]}</small>
                          )}
                          <b>{prod.nomeProduto}</b>
                          <span className="price">{fmtBRL(prod.valorVenda)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ========= RIGHT: Cart ========= */}
            <div className="pdv-cart">
              <div className="cart-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ShoppingCart size={20} strokeWidth={1.8} />
                  <h3>Carrinho</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {cart.length > 0 && (
                    <button
                      className="btn-icon danger"
                      title="Limpar carrinho"
                      onClick={clearCart}
                      style={{ width: 30, height: 30 }}
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  )}
                  <span className="venda-cart-count">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              {sucesso && (
                <div className="venda-sucesso">
                  <CheckCircle size={18} strokeWidth={2} />
                  Venda finalizada com sucesso!
                </div>
              )}

              {erro && (
                <div className="modal-error" style={{ margin: '12px 16px 0' }}>
                  {erro}
                </div>
              )}

              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingCart size={32} strokeWidth={1.2} />
                    <p>Nenhum item adicionado</p>
                    <small>Clique nos produtos ao lado para adicionar</small>
                  </div>
                ) : (
                  cart.map(({ produto, tamanho, quantidade }) => {
                    const tamLabel   = TAMANHOS.find(t => t.value === tamanho)?.label ?? '?';
                    const estoqueDisp = produto.estoques.find(e => e.tamanho === tamanho)?.quantidade ?? 0;
                    return (
                      <div key={cartKey(produto.produtoId, tamanho)} className="cart-item">
                        <div className="cart-item-thumb">
                          {produto.imagemUrls.length > 0 ? (
                            <img
                              src={imageUrl(produto.imagemUrls[0])}
                              alt={produto.nomeProduto}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ShoppingBag size={22} strokeWidth={1.2} color="var(--fg-soft)" />
                          )}
                        </div>

                        <div className="cart-item-info">
                          <b>{produto.nomeProduto}</b>
                          <small>
                            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '.06em', marginRight: 6 }}>
                              {tamLabel}
                            </span>
                            {fmtBRL(produto.valorVenda)} / un
                          </small>
                        </div>

                        <div className="cart-qty">
                          <button onClick={() => updateQty(produto.produtoId, tamanho, -1)}>
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span>{quantidade}</span>
                          <button
                            onClick={() => updateQty(produto.produtoId, tamanho, 1)}
                            disabled={quantidade >= estoqueDisp}
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>

                        <span className="cart-item-price">
                          {fmtBRL(produto.valorVenda * quantidade)}
                        </span>

                        <button
                          className="cart-item-remove"
                          onClick={() => removeFromCart(produto.produtoId, tamanho)}
                          title="Remover item"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="cart-totals">
                <div className="cart-line">
                  <span className="lbl">Subtotal</span>
                  <span>{fmtBRL(subtotal)}</span>
                </div>
                <div className="cart-line">
                  <span className="lbl">Itens</span>
                  <span>{totalItems}</span>
                </div>
                <div className="cart-total">
                  <span className="lbl">Total</span>
                  <b>{fmtBRL(subtotal)}</b>
                </div>
              </div>

              <div className="cart-cta">
                <button
                  className="btn-primary red"
                  onClick={handleFinalizar}
                  disabled={cart.length === 0 || finalizando}
                >
                  {finalizando ? 'Finalizando…' : 'Finalizar Venda'}
                  {!finalizando && <CheckCircle size={16} strokeWidth={2} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== Seletor de Tamanho ===== */}
      {tamPicker && !qtyPicker && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setTamPicker(null); }}
        >
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">Selecionar tamanho</p>
                <h3>{tamPicker.nomeProduto}</h3>
              </div>
              <button className="modal-close" onClick={() => setTamPicker(null)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 16 }}>
              Escolha o tamanho para prosseguir:
            </p>

            <div className="size-modal-grid">
              {TAMANHOS.map(t => {
                const qty      = tamPicker.estoques.find(e => e.tamanho === t.value)?.quantidade ?? 0;
                const hasStock = qty > 0;
                if (!tamPicker.estoques.some(e => e.tamanho === t.value)) return null;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`size-opt${!hasStock ? ' disabled' : ''}`}
                    disabled={!hasStock}
                    onClick={() => openQtyPicker(tamPicker, t.value)}
                    style={{ position: 'relative', opacity: hasStock ? 1 : 0.35 }}
                    title={hasStock ? `${qty} disponível` : 'Esgotado'}
                  >
                    {t.label}
                    <span style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 8,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      letterSpacing: '.06em',
                      color: hasStock ? 'var(--green)' : 'var(--fg-soft)',
                    }}>
                      {qty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== Picker de Quantidade ===== */}
      {qtyPicker && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setQtyPicker(null); }}
        >
          <div className="modal" style={{ maxWidth: 340 }}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  {TAMANHOS.find(t => t.value === qtyPicker.tamanho)?.label} ·{' '}
                  {fmtBRL(qtyPicker.produto.valorVenda)} / un
                </p>
                <h3>{qtyPicker.produto.nomeProduto}</h3>
              </div>
              <button className="modal-close" onClick={() => setQtyPicker(null)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--fg-mute)', marginBottom: 20 }}>
              Informe a quantidade desejada:
            </p>

            {/* Controle de quantidade */}
            <div className="qty-picker-ctrl">
              <button
                className="qty-picker-btn"
                onClick={() => setQtyInput(q => Math.max(1, q - 1))}
                disabled={qtyInput <= 1}
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <input
                ref={qtyInputRef}
                type="number"
                className="qty-picker-input"
                min={1}
                max={qtyPicker.estoqueDisp}
                value={qtyInput}
                onChange={e => {
                  const v = parseInt(e.target.value) || 1;
                  setQtyInput(Math.min(Math.max(1, v), qtyPicker.estoqueDisp));
                }}
                onKeyDown={e => { if (e.key === 'Enter') confirmQty(); }}
              />
              <button
                className="qty-picker-btn"
                onClick={() => setQtyInput(q => Math.min(q + 1, qtyPicker.estoqueDisp))}
                disabled={qtyInput >= qtyPicker.estoqueDisp}
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="qty-picker-preview">
              <span>Total</span>
              <b>{fmtBRL(qtyPicker.produto.valorVenda * qtyInput)}</b>
            </div>

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--fg-soft)', textAlign: 'center', marginBottom: 20 }}>
              {qtyPicker.estoqueDisp} unidade{qtyPicker.estoqueDisp !== 1 ? 's' : ''} disponível
            </p>

            <div className="modal-actions">
              <button className="btn-ghost btn-sm" onClick={() => setQtyPicker(null)}>
                Cancelar
              </button>
              <div className="modal-actions-right">
                <button className="btn-primary red" onClick={confirmQty}>
                  <Plus size={14} strokeWidth={2.5} />
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddVenda;
