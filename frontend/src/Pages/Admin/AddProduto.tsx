import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, ChevronDown, Check } from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import RichTextEditor from '../../Components/Admin/RichTextEditor';
import {
  create, update, getById, uploadImagem, imageUrl,
  TAMANHOS, type ProdutoCreateDTO, type ProdutoEstoqueItem,
} from '../../Services/produtoService';
import { getAll as getCategorias, type CategoriaDTO } from '../../Services/categoriaService';
import '../../Styles/Admin/produto.css';
import '../../Styles/Admin/categoria.css';

/* ---------- modal ---------- */
interface ModalProps { onClose: () => void; children: React.ReactNode; title: string; eyebrow?: string; }
const Modal: React.FC<ModalProps> = ({ onClose, children, title, eyebrow }) => (
  <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal">
      <div className="modal-head">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h3>{title}</h3>
        </div>
        <button className="modal-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
      </div>
      {children}
    </div>
  </div>
);

/* ============================================================ */
const AddProduto: React.FC = () => {
  const navigate = useNavigate();
  const { produtoId } = useParams<{ produtoId?: string }>();
  const isEdit = !!produtoId;
  const fileRef = useRef<HTMLInputElement>(null);

  /* form state */
  const [nomeProduto, setNomeProduto]   = useState('');
  const [descricao, setDescricao]       = useState('');
  const [imagemUrls, setImagemUrls]     = useState<string[]>([]);
  const [valorCompra, setValorCompra]   = useState('');
  const [valorVenda, setValorVenda]     = useState('');
  const [categoriaIds, setCategoriaIds] = useState<number[]>([]);
  const [ativo, setAtivo]               = useState(true);
  const [destaque, setDestaque]         = useState(false);

  /**
   * Mapa tamanho.value → quantidade (como string para o input).
   * Inicializa todos com '' (vazio = 0).
   */
  const [estoques, setEstoques] = useState<Record<number, string>>(
    () => Object.fromEntries(TAMANHOS.map(t => [t.value, '']))
  );

  /* aux state */
  const [categorias, setCategorias]     = useState<CategoriaDTO[]>([]);
  const [uploading, setUploading]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [dragIdx, setDragIdx]           = useState<number | null>(null);
  const [dragOver, setDragOver]         = useState<number | null>(null);

  /* modals */
  const [catModal, setCatModal]         = useState(false);
  const [tempCats, setTempCats]         = useState<number[]>([]);

  /* load aux data */
  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
    if (isEdit && produtoId) {
      getById(Number(produtoId)).then(p => {
        setNomeProduto(p.nomeProduto);
        setDescricao(p.descricao ?? '');
        setImagemUrls(p.imagemUrls);
        setValorCompra(String(p.valorCompra));
        setValorVenda(String(p.valorVenda));
        setCategoriaIds(p.categoriaIds);
        setAtivo(p.ativo);
        setDestaque(p.destaque);
        // Carrega estoques existentes no mapa
        const map: Record<number, string> = Object.fromEntries(TAMANHOS.map(t => [t.value, '']));
        p.estoques.forEach(e => { map[e.tamanho] = String(e.quantidade); });
        setEstoques(map);
      }).catch(() => navigate('/produtos'));
    }
  }, []);

  /* ---- image upload ---- */
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try { uploaded.push(await uploadImagem(file)); }
      catch (e: unknown) { setError(e instanceof Error ? e.message : 'Erro no upload.'); }
    }
    setImagemUrls(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  /* ---- drag reorder ---- */
  const onDragStart = (i: number) => { setDragIdx(i); setDragOver(i); };
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOver(i);
    if (dragIdx === null || dragIdx === i) return;
    setImagemUrls(prev => {
      const arr = [...prev];
      const [item] = arr.splice(dragIdx, 1);
      arr.splice(i, 0, item);
      return arr;
    });
    setDragIdx(i);
  };
  const onDragEnd = () => { setDragIdx(null); setDragOver(null); };

  /* ---- category modal ---- */
  const openCatModal = () => { setTempCats([...categoriaIds]); setCatModal(true); };
  const toggleTempCat = (id: number) =>
    setTempCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const confirmCats = () => { setCategoriaIds(tempCats); setCatModal(false); };

  /* ---- helpers ---- */
  const totalEstoque = TAMANHOS.reduce((sum, t) => sum + (parseInt(estoques[t.value], 10) || 0), 0);

  const buildEstoquesDTO = (): ProdutoEstoqueItem[] =>
    TAMANHOS
      .map(t => ({ tamanho: t.value, quantidade: parseInt(estoques[t.value], 10) || 0 }))
      .filter(e => e.quantidade > 0);

  /* ---- submit ---- */
  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!nomeProduto.trim())       { setError('Nome do produto é obrigatório.');       return; }
    if (totalEstoque === 0)        { setError('Informe ao menos um tamanho com quantidade > 0.'); return; }
    if (categoriaIds.length === 0) { setError('Selecione ao menos uma categoria.');    return; }
    if (!valorCompra || !valorVenda){ setError('Informe os valores de compra e venda.'); return; }

    setSaving(true);
    setError('');
    const dto: ProdutoCreateDTO = {
      nomeProduto: nomeProduto.trim(),
      descricao: descricao.trim() || undefined,
      imagemUrls,
      estoques: buildEstoquesDTO(),
      valorCompra: parseFloat(valorCompra.replace(',', '.')),
      valorVenda:  parseFloat(valorVenda.replace(',', '.')),
      categoriaIds,
      ativo,
      destaque,
    };
    try {
      if (isEdit && produtoId) await update(Number(produtoId), dto);
      else await create(dto);
      navigate('/produtos');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const catName = (id: number) => categorias.find(c => c.categoriaId === id)?.nomeCategoria ?? String(id);

  return (
    <div className="admin-shell">
      <SideBar />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <span onClick={() => navigate('/produtos')} style={{ cursor: 'pointer' }}>Produtos</span>
            <span className="sep">/</span>
            <b>{isEdit ? 'Editar' : 'Novo'}</b>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <button className="page-back" onClick={() => navigate('/produtos')}>
            <ArrowLeft size={14} strokeWidth={2} />
            Voltar para produtos
          </button>

          <div className="page-head" style={{ marginBottom: 24 }}>
            <div>
              <p className="page-eyebrow">Catálogo</p>
              <h1 className="page-title">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h1>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => navigate('/produtos')}>Cancelar</button>
              <button className="btn-primary red" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Salvando…' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </div>
          </div>

          {error && <p className="modal-error" style={{ marginBottom: 20 }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* ===== LEFT ===== */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Info */}
                <div className="form-section">
                  <h3>Informações</h3>
                  <p className="hint">Dados principais do produto</p>
                  <div className="field">
                    <label>Nome do Produto <span className="req">*</span></label>
                    <input type="text" placeholder="Ex: Camisa Real Madrid 2024/25" value={nomeProduto} onChange={e => setNomeProduto(e.target.value)} required />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Descrição</label>
                    <RichTextEditor
                      value={descricao}
                      onChange={setDescricao}
                      placeholder="Detalhes do produto, material, versão…"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="form-section">
                  <h3>Imagens</h3>
                  <p className="hint">Arraste para reordenar · Primeira imagem é a capa</p>

                  <label
                    className="img-upload-area"
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--ink)'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = ''; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = ''; handleFiles(e.dataTransfer.files); }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={e => handleFiles(e.target.files)}
                    />
                    <Upload size={22} strokeWidth={1.8} color="var(--fg-mute)" />
                    <span className="img-upload-label">Clique ou arraste imagens aqui</span>
                    <span className="img-upload-sub">JPG, PNG, WEBP · Máx. 5 MB por arquivo</span>
                  </label>

                  {uploading && (
                    <div className="img-uploading">
                      <span className="upload-spin" />
                      Enviando…
                    </div>
                  )}

                  {imagemUrls.length > 0 && (
                    <div className="img-grid">
                      {imagemUrls.map((url, i) => (
                        <div
                          key={url + i}
                          className={`img-item${dragIdx === i ? ' dragging' : ''}${dragOver === i && dragIdx !== i ? ' drag-over' : ''}`}
                          draggable
                          onDragStart={() => onDragStart(i)}
                          onDragOver={e => onDragOver(e, i)}
                          onDragEnd={onDragEnd}
                        >
                          <img src={imageUrl(url)} alt={`Imagem ${i + 1}`} />
                          <span className="img-item-order">{i + 1}</span>
                          <button
                            type="button"
                            className="img-item-remove"
                            onClick={() => setImagemUrls(prev => prev.filter((_, j) => j !== i))}
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== RIGHT ===== */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Pricing */}
                <div className="form-section">
                  <h3>Preços</h3>
                  <p className="hint">Valores em Real (BRL)</p>
                  <div className="field-row" style={{ marginBottom: 0 }}>
                    <div className="field">
                      <label>Valor de Compra <span className="req">*</span></label>
                      <input type="number" step="0.01" min="0" placeholder="0,00" value={valorCompra} onChange={e => setValorCompra(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Valor de Venda <span className="req">*</span></label>
                      <input type="number" step="0.01" min="0" placeholder="0,00" value={valorVenda} onChange={e => setValorVenda(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Estoque por tamanho */}
                <div className="form-section">
                  <h3>Estoque por Tamanho <span className="req">*</span></h3>
                  <p className="hint">
                    Informe a quantidade disponível para cada tamanho · Total:{' '}
                    <b style={{ color: totalEstoque > 0 ? 'var(--fg)' : 'var(--fg-soft)' }}>{totalEstoque}</b>
                  </p>

                  <div className="estoque-grid">
                    {TAMANHOS.map(t => {
                      const qty = parseInt(estoques[t.value], 10) || 0;
                      return (
                        <div key={t.value} className={`estoque-cell${qty > 0 ? ' has-stock' : ''}`}>
                          <span className="estoque-cell-label">{t.label}</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={estoques[t.value]}
                            onChange={e => setEstoques(prev => ({ ...prev, [t.value]: e.target.value }))}
                            className="estoque-cell-input"
                          />
                          {qty > 0 && (
                            <span className="estoque-cell-qty">{qty} un</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Organisation */}
                <div className="form-section">
                  <h3>Organização</h3>
                  <p className="hint">Enter nos campos para abrir o seletor</p>

                  {/* Categorias */}
                  <div className="field">
                    <label>Categorias <span className="req">*</span></label>
                    <button
                      type="button"
                      className="picker-btn"
                      onClick={openCatModal}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), openCatModal())}
                      style={{ alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10 }}
                    >
                      {categoriaIds.length > 0
                        ? <div className="picker-chips">
                            {categoriaIds.map(id => (
                              <span key={id} className="picker-chip">{catName(id)}</span>
                            ))}
                          </div>
                        : <span className="placeholder">Selecionar categorias…</span>
                      }
                      <ChevronDown size={16} strokeWidth={1.8} color="var(--fg-mute)" style={{ flexShrink: 0, marginTop: 2 }} />
                    </button>
                  </div>

                  {/* Ativo */}
                  <div className="field">
                    <label>Status do Produto</label>
                    <div className="toggle-row">
                      <span>{ativo ? 'Ativo no catálogo' : 'Inativo (oculto)'}</span>
                      <button type="button" className={`toggle${ativo ? ' on' : ''}`} onClick={() => setAtivo(v => !v)} />
                    </div>
                  </div>

                  {/* Destaque */}
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Destaque na Home</label>
                    <div className="toggle-row">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span>{destaque ? 'Exibir na seção Destaques' : 'Não exibir nos Destaques'}</span>
                        <small style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.08em', color: 'var(--fg-soft)', textTransform: 'uppercase' }}>
                          Aparece na landing page
                        </small>
                      </div>
                      <button
                        type="button"
                        className={`toggle${destaque ? ' on' : ''}`}
                        onClick={() => setDestaque(v => !v)}
                        style={destaque ? { background: 'var(--red)' } : {}}
                      />
                    </div>
                  </div>
                </div>

                {/* Margin preview */}
                {valorCompra && valorVenda && (
                  <div className="form-section" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 16 }}>Margem</h3>
                    {(() => {
                      const compra = parseFloat(valorCompra);
                      const venda  = parseFloat(valorVenda);
                      const margem = venda - compra;
                      const pct    = compra > 0 ? ((margem / compra) * 100).toFixed(1) : '—';
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>
                            Lucro bruto
                          </span>
                          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: margem >= 0 ? 'var(--green)' : 'var(--red)' }}>
                            {margem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            <small style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--fg-mute)', marginLeft: 6, fontWeight: 400 }}>
                              {pct}%
                            </small>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* ===== CATEGORIAS MODAL ===== */}
      {catModal && (
        <Modal onClose={() => setCatModal(false)} eyebrow="Múltipla seleção" title="Categorias">
          {categorias.length === 0
            ? <p style={{ color: 'var(--fg-mute)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Nenhuma categoria cadastrada.</p>
            : <div className="cat-pick-list">
                {categorias.map(cat => {
                  const sel = tempCats.includes(cat.categoriaId);
                  return (
                    <button
                      key={cat.categoriaId}
                      type="button"
                      className={`cat-pick-item${sel ? ' selected' : ''}`}
                      onClick={() => toggleTempCat(cat.categoriaId)}
                    >
                      <span className="cat-pick-check">
                        {sel && <Check size={11} strokeWidth={3} color="#0a0a0a" />}
                      </span>
                      {cat.nomeCategoria}
                    </button>
                  );
                })}
              </div>
          }
          <div className="modal-actions">
            <div className="modal-actions-right">
              <button type="button" className="btn-ghost btn-sm" onClick={() => setCatModal(false)}>Cancelar</button>
              <button type="button" className="btn-primary red btn-sm" onClick={confirmCats}>
                Confirmar {tempCats.length > 0 && `(${tempCats.length})`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddProduto;
