import React, { useEffect, useState, useMemo } from 'react';
import Header from '../Components/Home/Header';
import ProdutoModal from '../Components/Home/ProdutoModal';
import WhatsAppFloat from '../Components/Home/WhatsAppFloat';
import { getAll as getProdutos, imageUrl, TAMANHOS, type ProdutoDTO } from '../Services/produtoService';
import { getAll as getCategorias, type CategoriaDTO } from '../Services/categoriaService';
import '../Styles/catalogo.css';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Tamanhos disponíveis (com estoque > 0) concatenados */
const tamanhoLabels = (estoques: { tamanho: number; quantidade: number }[]): string => {
  const disponiveis = estoques
    .filter(e => e.quantidade > 0)
    .map(e => TAMANHOS.find(t => t.value === e.tamanho)?.label ?? '?');
  return disponiveis.length > 0 ? disponiveis.join(' · ') : '—';
};

const Catalogo: React.FC = () => {
  const [produtos, setProdutos]       = useState<ProdutoDTO[]>([]);
  const [categorias, setCategorias]   = useState<CategoriaDTO[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [catAtiva, setCatAtiva]       = useState<number | null>(null);
  const [tamAtivo, setTamAtivo]       = useState<number | null>(null);
  const [modal, setModal]             = useState<ProdutoDTO | null>(null);
  const [ordem, setOrdem]             = useState<'az' | 'za' | 'menor' | 'maior'>('az');

  useEffect(() => {
    Promise.all([getProdutos(), getCategorias()])
      .then(([prods, cats]) => {
        setProdutos(prods.filter(p => p.ativo));
        setCategorias(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...produtos];

    if (search.trim())
      list = list.filter(p =>
        p.nomeProduto.toLowerCase().includes(search.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(search.toLowerCase())
      );

    if (catAtiva !== null)
      list = list.filter(p => p.categoriaIds.includes(catAtiva));

    if (tamAtivo !== null)
      list = list.filter(p => p.estoques.some(e => e.tamanho === tamAtivo && e.quantidade > 0));

    switch (ordem) {
      case 'az':    list.sort((a, b) => a.nomeProduto.localeCompare(b.nomeProduto)); break;
      case 'za':    list.sort((a, b) => b.nomeProduto.localeCompare(a.nomeProduto)); break;
      case 'menor': list.sort((a, b) => a.valorVenda - b.valorVenda); break;
      case 'maior': list.sort((a, b) => b.valorVenda - a.valorVenda); break;
    }

    return list;
  }, [produtos, search, catAtiva, tamAtivo, ordem]);

  const limparFiltros = () => {
    setSearch('');
    setCatAtiva(null);
    setTamAtivo(null);
    setOrdem('az');
  };

  const temFiltro = search || catAtiva !== null || tamAtivo !== null || ordem !== 'az';

  return (
    <div className="cat-page">
      <Header />

      <main className="cat-main">

        {/* ---- Page header ---- */}
        <div className="cat-page-head">
          <div className="cat-page-head-inner">
            <div>
              <p className="cat-page-eyebrow">Loja</p>
              <h1 className="cat-page-title">Catálogo</h1>
              <p className="cat-page-sub">
                {loading ? '…' : `${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Search */}
            <div className="cat-search-wrap">
              <span className="cat-search-icon" />
              <input
                className="cat-search-input"
                placeholder="Buscar por nome ou descrição…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="cat-search-clear" onClick={() => setSearch('')} aria-label="Limpar" />
              )}
            </div>
          </div>
        </div>

        {/* ---- Filters bar ---- */}
        <div className="cat-filters-bar">
          <div className="cat-filters-inner">

            {/* Category chips */}
            <div className="cat-filter-group">
              <button
                className={`cat-chip${catAtiva === null ? ' active' : ''}`}
                onClick={() => setCatAtiva(null)}
              >
                Todos
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.categoriaId}
                  className={`cat-chip${catAtiva === cat.categoriaId ? ' active' : ''}`}
                  onClick={() => setCatAtiva(prev => prev === cat.categoriaId ? null : cat.categoriaId)}
                >
                  {cat.nomeCategoria}
                </button>
              ))}
            </div>

            <div className="cat-filter-divider" />

            {/* Size chips */}
            <div className="cat-filter-group">
              {TAMANHOS.map(t => (
                <button
                  key={t.value}
                  className={`cat-chip cat-chip-size${tamAtivo === t.value ? ' active' : ''}`}
                  onClick={() => setTamAtivo(prev => prev === t.value ? null : t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="cat-filter-spacer" />

            {/* Order */}
            <select
              className="cat-order-select"
              value={ordem}
              onChange={e => setOrdem(e.target.value as typeof ordem)}
            >
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>

            {/* Clear filters */}
            {temFiltro && (
              <button className="cat-clear-btn" onClick={limparFiltros}>
                <span className="cat-clear-icon" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* ---- Grid ---- */}
        <div className="cat-grid-wrap">
          {loading ? (
            <div className="cat-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="cat-prod-card cat-prod-card--skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="cat-empty">
              <span className="cat-empty-icon" />
              <p>Nenhum produto encontrado</p>
              <button className="cat-chip" onClick={limparFiltros}>Limpar filtros</button>
            </div>
          ) : (
            <div className="cat-grid">
              {filtered.map(prod => (
                <article
                  key={prod.produtoId}
                  className="cat-prod-card"
                  onClick={() => setModal(prod)}
                >
                  {/* Image */}
                  <div className="cat-prod-img-wrap">
                    {prod.imagemUrls.length > 0 ? (
                      <img
                        src={imageUrl(prod.imagemUrls[0])}
                        alt={prod.nomeProduto}
                        className="cat-prod-img"
                      />
                    ) : (
                      <div className="cat-prod-img-empty" />
                    )}

                    {/* Category badges */}
                    {prod.categorias.length > 0 && (
                      <div className="cat-prod-badges">
                        {prod.categorias.slice(0, 1).map((c, i) => (
                          <span key={i} className="cat-prod-badge">{c}</span>
                        ))}
                      </div>
                    )}

                    {/* Size pill */}
                    <span className="cat-prod-size">{tamanhoLabels(prod.estoques)}</span>

                    {/* Out of stock overlay */}
                    {prod.quantidadeTotal === 0 && (
                      <div className="cat-prod-out">Esgotado</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="cat-prod-info">
                    {prod.categorias.length > 0 && (
                      <p className="cat-prod-cat">{prod.categorias.join(' · ')}</p>
                    )}
                    <h3 className="cat-prod-name">{prod.nomeProduto}</h3>
                    <div className="cat-prod-bottom">
                      <span className="cat-prod-price">{fmtBRL(prod.valorVenda)}</span>
                      {prod.quantidadeTotal > 0 && prod.quantidadeTotal <= 3 && (
                        <span className="cat-prod-low">Últimas {prod.quantidadeTotal}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {modal && (
        <ProdutoModal produto={modal} onClose={() => setModal(null)} />
      )}

      <WhatsAppFloat />
    </div>
  );
};

export default Catalogo;
