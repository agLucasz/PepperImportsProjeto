import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import { getAll, remove, imageUrl, TAMANHOS, type ProdutoDTO } from '../../Services/produtoService';
import '../../Styles/Admin/produto.css';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Produto: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const carregar = async () => {
    setLoading(true);
    try { setProdutos(await getAll()); }
    catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleDelete = async (id: number) => {
    try { await remove(id); await carregar(); }
    catch { /* silently ignore */ }
    finally { setConfirmDelete(null); }
  };

  const filtered = produtos.filter(p =>
    p.nomeProduto.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-shell">
      <SideBar badges={{ produtos: produtos.length }} />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Produtos</b>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">Catálogo</p>
              <h1 className="page-title">Produtos</h1>
              <p className="page-sub">
                Gerencie todos os produtos disponíveis no catálogo de importações.
              </p>
            </div>
            <button className="btn-primary red" onClick={() => navigate('/produtos/novo')}>
              <Plus size={16} strokeWidth={2.5} />
              Novo Produto
            </button>
          </div>

          {/* ---- Table ---- */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-search">
                <Search size={14} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  placeholder="Filtrar por nome…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="table-filters">
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-mute)',
                }}>
                  {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categorias</th>
                  <th>Estoque</th>
                  <th>Compra</th>
                  <th>Venda</th>
                  <th>Status</th>
                  <th>Destaque</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                      Carregando…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--fg-soft)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
                {!loading && filtered.map(prod => {
                  const totalQty = prod.quantidadeTotal;
                  return (
                    <tr key={prod.produtoId} className="row">
                      <td>
                        <div className="prod-cell">
                          <div className="prod-thumb">
                            {prod.imagemUrls.length > 0
                              ? <img src={imageUrl(prod.imagemUrls[0])} alt={prod.nomeProduto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : null
                            }
                          </div>
                          <div className="prod-meta">
                            <b>{prod.nomeProduto}</b>
                            {prod.descricao && (
                              <small style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                                {prod.descricao}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {prod.categorias.map((cat, i) => (
                            <span key={i} className="picker-chip">{cat}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {prod.estoques.length === 0 ? (
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--fg-soft)' }}>—</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Total */}
                            <span style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 12,
                              fontWeight: 600,
                              color: totalQty === 0 ? 'var(--fg-soft)' : totalQty <= 3 ? 'var(--amber)' : 'var(--fg)',
                            }}>
                              {totalQty} un
                            </span>
                            {/* Breakdown por tamanho */}
                            <div className="stock-breakdown">
                              {prod.estoques
                                .slice()
                                .sort((a, b) => a.tamanho - b.tamanho)
                                .map(e => {
                                  const label = TAMANHOS.find(t => t.value === e.tamanho)?.label ?? String(e.tamanho);
                                  return (
                                    <span
                                      key={e.tamanho}
                                      className={`stock-pill${e.quantidade === 0 ? ' out' : e.quantidade <= 2 ? ' low' : ''}`}
                                    >
                                      {label}&nbsp;{e.quantidade}
                                    </span>
                                  );
                                })
                              }
                            </div>
                          </div>
                        )}
                      </td>
                      <td><span className="price">{fmtBRL(prod.valorCompra)}</span></td>
                      <td><span className="price">{fmtBRL(prod.valorVenda)}</span></td>
                      <td>
                        <span className={`prod-status ${prod.ativo ? 'ativo' : 'inativo'}`}>
                          {prod.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        {prod.destaque
                          ? <span className="prod-status ativo" style={{ background: 'rgba(225,20,10,.12)', color: 'var(--red)' }}>
                              ★ Destaque
                            </span>
                          : <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.1em', color: 'var(--fg-soft)' }}>—</span>
                        }
                      </td>
                      <td className="actions">
                        {confirmDelete === prod.produtoId ? (
                          <div className="row-delete-confirm">
                            <button
                              className="btn-primary red btn-sm"
                              style={{ fontSize: 10, padding: '6px 12px' }}
                              onClick={() => handleDelete(prod.produtoId)}
                            >
                              Confirmar
                            </button>
                            <button
                              className="btn-ghost btn-sm"
                              style={{ fontSize: 10, padding: '6px 12px' }}
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="row-actions">
                            <button
                              className="btn-icon"
                              title="Editar"
                              onClick={() => navigate(`/produtos/editar/${prod.produtoId}`)}
                            >
                              <Pencil size={15} strokeWidth={1.8} />
                            </button>
                            <button
                              className="btn-icon danger"
                              title="Excluir"
                              onClick={() => setConfirmDelete(prod.produtoId)}
                            >
                              <Trash2 size={15} strokeWidth={1.8} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="table-foot">
              <span>{filtered.length} de {produtos.length} produto{produtos.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Produto;
