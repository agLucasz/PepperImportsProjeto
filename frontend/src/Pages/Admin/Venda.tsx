import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Bell, Settings, ShoppingCart,
  Eye, Trash2, X, TrendingUp,
} from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import { getAll, cancel, type VendaDTO } from '../../Services/vendaService';
import '../../Styles/Admin/venda.css';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const Venda: React.FC = () => {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<VendaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<VendaDTO | null>(null);

  const carregar = async () => {
    setLoading(true);
    try { setVendas(await getAll()); }
    catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleCancel = async (id: number) => {
    try { await cancel(id); await carregar(); }
    catch { /* silently ignore */ }
    finally { setConfirmDelete(null); }
  };

  const filtered = vendas.filter(v =>
    String(v.vendaId).includes(search) ||
    v.itens.some(i => i.nomeProduto.toLowerCase().includes(search.toLowerCase()))
  );

  const totalFaturado = vendas.reduce((acc, v) => acc + v.valorVenda, 0);
  const ticketMedio = vendas.length ? totalFaturado / vendas.length : 0;

  return (
    <div className="admin-shell">
      <SideBar badges={{ pdv: vendas.length }} />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Vendas</b>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">PDV</p>
              <h1 className="page-title">Vendas</h1>
              <p className="page-sub">
                Acompanhe e gerencie todas as vendas realizadas.
              </p>
            </div>
            <button className="btn-primary red" onClick={() => navigate('/pdv/nova')}>
              <Plus size={16} strokeWidth={2.5} />
              Nova Venda
            </button>
          </div>

          {/* ---- Summary ---- */}
          <div className="venda-summary">
            <div className="venda-stat-card">
              <div className="venda-stat-icon"><ShoppingCart size={20} strokeWidth={1.8} /></div>
              <div>
                <p className="venda-stat-label">Total de vendas</p>
                <p className="venda-stat-value">{vendas.length}</p>
              </div>
            </div>
            <div className="venda-stat-card">
              <div className="venda-stat-icon"><TrendingUp size={20} strokeWidth={1.8} /></div>
              <div>
                <p className="venda-stat-label">Faturamento total</p>
                <p className="venda-stat-value venda-stat-brl">{fmtBRL(totalFaturado)}</p>
              </div>
            </div>
            <div className="venda-stat-card">
              <div className="venda-stat-icon"><TrendingUp size={20} strokeWidth={1.8} /></div>
              <div>
                <p className="venda-stat-label">Ticket médio</p>
                <p className="venda-stat-value venda-stat-brl">{fmtBRL(ticketMedio)}</p>
              </div>
            </div>
          </div>

          {/* ---- Table ---- */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-search">
                <Search size={14} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  placeholder="Filtrar por produto ou ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="table-filters">
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--fg-mute)' }}>
                  {filtered.length} venda{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--fg-mute)', fontSize: 12 }}>
                      Carregando…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--fg-soft)', fontSize: 12 }}>
                      Nenhuma venda encontrada
                    </td>
                  </tr>
                )}
                {!loading && filtered.map(venda => (
                  <tr key={venda.vendaId} className="row">
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--fg-mute)' }}>
                      #{venda.vendaId}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {venda.itens.slice(0, 2).map(item => (
                          <span key={item.vendaItemId} className="picker-chip">
                            {item.nomeProduto} ×{item.quantidadeItem}
                          </span>
                        ))}
                        {venda.itens.length > 2 && (
                          <span className="picker-chip">+{venda.itens.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '.02em', color: 'var(--ink)' }}>
                        {fmtBRL(venda.valorVenda)}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                      {fmtDate(venda.dataVenda)}
                    </td>
                    <td className="actions">
                      {confirmDelete === venda.vendaId ? (
                        <div className="row-delete-confirm">
                          <button
                            className="btn-primary red btn-sm"
                            style={{ fontSize: 11, padding: '6px 12px' }}
                            onClick={() => handleCancel(venda.vendaId)}
                          >
                            Confirmar
                          </button>
                          <button
                            className="btn-ghost btn-sm"
                            style={{ fontSize: 11, padding: '6px 12px' }}
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button
                            className="btn-icon"
                            title="Ver detalhes"
                            onClick={() => setDetalhe(venda)}
                          >
                            <Eye size={15} strokeWidth={1.8} />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Cancelar venda"
                            onClick={() => setConfirmDelete(venda.vendaId)}
                          >
                            <Trash2 size={15} strokeWidth={1.8} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-foot">
              <span>{filtered.length} de {vendas.length} venda{vendas.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </main>

      {/* ---- Detalhe Modal ---- */}
      {detalhe && (
        <div className="modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="modal venda-detalhe-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">Venda</p>
                <h3>Detalhes #{detalhe.vendaId}</h3>
              </div>
              <button className="modal-close" onClick={() => setDetalhe(null)}>
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="venda-detalhe-itens">
              {detalhe.itens.map(item => (
                <div key={item.vendaItemId} className="venda-detalhe-item">
                  <div>
                    <p className="venda-detalhe-item-nome">{item.nomeProduto}</p>
                    <p className="venda-detalhe-item-sub">
                      {item.quantidadeItem}× {item.valorItem ? fmtBRL(item.valorItem) : '—'}
                    </p>
                  </div>
                  <span className="venda-detalhe-item-total">
                    {item.valorItem ? fmtBRL(item.valorItem * item.quantidadeItem) : '—'}
                  </span>
                </div>
              ))}
            </div>

            <div className="venda-detalhe-total">
              <span>Total</span>
              <b>{fmtBRL(detalhe.valorVenda)}</b>
            </div>

            <div className="modal-actions">
              <p style={{ fontSize: 12, color: 'var(--fg-mute)' }}>
                {fmtDate(detalhe.dataVenda)}
              </p>
              <div className="modal-actions-right">
                <button className="btn-ghost" onClick={() => setDetalhe(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venda;
