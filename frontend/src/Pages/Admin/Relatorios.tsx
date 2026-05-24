import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart2, TrendingUp, ShoppingCart, Wallet,
  CheckCircle, Clock, CalendarRange, Download,
} from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import { getAll as getVendas, type VendaDTO } from '../../Services/vendaService';
import { getAll as getContas, type ContaAPagarDTO } from '../../Services/contaAPagarService';
import { gerarPDFVendas, gerarPDFContas } from '../../Utils/gerarPDF';
import '../../Styles/Admin/relatorios.css';

type Aba = 'vendas' | 'contas';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : '—';

const toISODate = (d: Date) => d.toISOString().split('T')[0];

const primeiroDiaMes = () => {
  const d = new Date();
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
};

const hoje = () => toISODate(new Date());

const Relatorios: React.FC = () => {
  const [aba, setAba] = useState<Aba>('vendas');
  const [dataInicio, setDataInicio] = useState(primeiroDiaMes());
  const [dataFim, setDataFim] = useState(hoje());

  const [vendas, setVendas] = useState<VendaDTO[]>([]);
  const [contas, setContas] = useState<ContaAPagarDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [v, c] = await Promise.all([getVendas(), getContas()]);
        setVendas(v);
        setContas(c);
      } catch { /* silently ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  /* ---- Filtro de período ---- */
  const inicio = useMemo(() => dataInicio ? new Date(`${dataInicio}T00:00:00`) : null, [dataInicio]);
  const fim    = useMemo(() => dataFim    ? new Date(`${dataFim}T23:59:59`)    : null, [dataFim]);

  const inPeriod = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (inicio && d < inicio) return false;
    if (fim    && d > fim)    return false;
    return true;
  };

  /* ---- Vendas filtradas ---- */
  const vendasFiltradas = useMemo(
    () => vendas.filter(v => inPeriod(v.dataVenda)),
    [vendas, dataInicio, dataFim],
  );

  const totalVendas       = vendasFiltradas.reduce((a, v) => a + v.valorVenda, 0);
  const ticketMedio       = vendasFiltradas.length ? totalVendas / vendasFiltradas.length : 0;
  const totalItensVendidos = vendasFiltradas.reduce((a, v) => a + v.itens.reduce((s, i) => s + i.quantidadeItem, 0), 0);

  /* ---- Contas filtradas ---- */
  const contasFiltradas = useMemo(
    () => contas.filter(c => inPeriod(c.dataVencimento)),
    [contas, dataInicio, dataFim],
  );

  const totalEmAberto = contasFiltradas.filter(c => !c.pago).reduce((a, c) => a + c.valorParcela, 0);
  const totalPago     = contasFiltradas.filter(c =>  c.pago).reduce((a, c) => a + c.valorParcela, 0);
  const totalContas   = totalEmAberto + totalPago;

  return (
    <div className="admin-shell">
      <SideBar />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Relatórios</b>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">Análise</p>
              <h1 className="page-title">Relatórios</h1>
              <p className="page-sub">
                Acompanhe vendas e contas a pagar por período.
              </p>
            </div>
            <button
              className="btn-primary red"
              disabled={loading}
              onClick={() =>
                aba === 'vendas'
                  ? gerarPDFVendas(vendasFiltradas, dataInicio, dataFim)
                  : gerarPDFContas(contasFiltradas, dataInicio, dataFim)
              }
            >
              <Download size={16} strokeWidth={2.5} />
              Baixar PDF
            </button>
          </div>

          {/* ---- Abas ---- */}
          <div className="rel-tabs">
            <button
              className={`rel-tab${aba === 'vendas' ? ' active' : ''}`}
              onClick={() => setAba('vendas')}
            >
              <ShoppingCart size={16} strokeWidth={1.8} />
              Vendas
            </button>
            <button
              className={`rel-tab${aba === 'contas' ? ' active' : ''}`}
              onClick={() => setAba('contas')}
            >
              <Wallet size={16} strokeWidth={1.8} />
              Contas a Pagar
            </button>
          </div>

          {/* ---- Filtro de período ---- */}
          <div className="rel-period-bar">
            <CalendarRange size={15} strokeWidth={1.8} color="var(--fg-mute)" />
            <span className="rel-period-label">Período</span>
            <div className="rel-period-fields">
              <div className="rel-period-field">
                <label>De</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  onBlur={e => e.target.value && setDataInicio(e.target.value)}
                />
              </div>
              <span className="rel-period-sep">—</span>
              <div className="rel-period-field">
                <label>Até</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  onBlur={e => e.target.value && setDataFim(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════ VENDAS ══════════════════════════════════ */}
          {aba === 'vendas' && (
            <>
              {/* Summary */}
              <div className="rel-summary">
                <div className="rel-stat-card">
                  <div className="rel-stat-icon">
                    <ShoppingCart size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Vendas no período</p>
                    <p className="rel-stat-value">{vendasFiltradas.length}</p>
                  </div>
                </div>

                <div className="rel-stat-card rel-stat-card--green">
                  <div className="rel-stat-icon rel-stat-icon--green">
                    <TrendingUp size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Faturamento total</p>
                    <p className="rel-stat-value rel-stat-brl">{fmtBRL(totalVendas)}</p>
                  </div>
                </div>

                <div className="rel-stat-card">
                  <div className="rel-stat-icon">
                    <BarChart2 size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Ticket médio</p>
                    <p className="rel-stat-value rel-stat-brl">{fmtBRL(ticketMedio)}</p>
                  </div>
                </div>

                <div className="rel-stat-card">
                  <div className="rel-stat-icon">
                    <ShoppingCart size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Itens vendidos</p>
                    <p className="rel-stat-value">{totalItensVendidos}</p>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="table-wrap">
                <div className="table-toolbar">
                  <span className="rel-table-title">Vendas do período</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--fg-mute)' }}>
                    {vendasFiltradas.length} venda{vendasFiltradas.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Itens</th>
                      <th>Qtd. Itens</th>
                      <th>Total</th>
                      <th>Data</th>
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
                    {!loading && vendasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--fg-soft)', fontSize: 12, padding: '32px 0' }}>
                          Nenhuma venda no período selecionado
                        </td>
                      </tr>
                    )}
                    {!loading && vendasFiltradas.map(v => (
                      <tr key={v.vendaId} className="row">
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--fg-mute)' }}>
                          #{v.vendaId}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {v.itens.slice(0, 2).map(item => (
                              <span key={item.vendaItemId} className="picker-chip">
                                {item.nomeProduto} ×{item.quantidadeItem}
                              </span>
                            ))}
                            {v.itens.length > 2 && (
                              <span className="picker-chip">+{v.itens.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                          {v.itens.reduce((s, i) => s + i.quantidadeItem, 0)}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '.02em', color: 'var(--ink)' }}>
                            {fmtBRL(v.valorVenda)}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                          {fmtDate(v.dataVenda)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!loading && vendasFiltradas.length > 0 && (
                  <div className="table-foot">
                    <span>Total faturado no período</span>
                    <span className="rel-table-total">{fmtBRL(totalVendas)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════ CONTAS ══════════════════════════════════ */}
          {aba === 'contas' && (
            <>
              {/* Summary */}
              <div className="rel-summary">
                <div className="rel-stat-card">
                  <div className="rel-stat-icon">
                    <Wallet size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Parcelas no período</p>
                    <p className="rel-stat-value">{contasFiltradas.length}</p>
                  </div>
                </div>

                <div className="rel-stat-card rel-stat-card--danger">
                  <div className="rel-stat-icon rel-stat-icon--danger">
                    <Clock size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Em aberto</p>
                    <p className="rel-stat-value rel-stat-brl">{fmtBRL(totalEmAberto)}</p>
                  </div>
                </div>

                <div className="rel-stat-card rel-stat-card--green">
                  <div className="rel-stat-icon rel-stat-icon--green">
                    <CheckCircle size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Total pago</p>
                    <p className="rel-stat-value rel-stat-brl">{fmtBRL(totalPago)}</p>
                  </div>
                </div>

                <div className="rel-stat-card">
                  <div className="rel-stat-icon">
                    <BarChart2 size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="rel-stat-label">Total do período</p>
                    <p className="rel-stat-value rel-stat-brl">{fmtBRL(totalContas)}</p>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="table-wrap">
                <div className="table-toolbar">
                  <span className="rel-table-title">Contas a Pagar do período</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--fg-mute)' }}>
                    {contasFiltradas.length} parcela{contasFiltradas.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Despesa</th>
                      <th>Parcela</th>
                      <th>Vencimento</th>
                      <th>Valor</th>
                      <th>Status</th>
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
                    {!loading && contasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--fg-soft)', fontSize: 12, padding: '32px 0' }}>
                          Nenhuma conta a pagar no período selecionado
                        </td>
                      </tr>
                    )}
                    {!loading && contasFiltradas.map(c => (
                      <tr key={c.contaAPagarId} className="row">
                        <td>
                          <div className="conta-nome-cell">
                            <div className="conta-dot" />
                            <span>{c.nomeDespesa}</span>
                          </div>
                        </td>
                        <td>
                          <span className="conta-parcela-badge">
                            {c.numeroParcela}/{c.totalParcelas}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                          {fmtDate(c.dataVencimento)}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '.02em', color: 'var(--ink)' }}>
                            {fmtBRL(c.valorParcela)}
                          </span>
                        </td>
                        <td>
                          <span className={`conta-status ${c.pago ? 'pago' : 'aberto'}`}>
                            {c.pago ? 'Pago' : 'Em aberto'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!loading && contasFiltradas.length > 0 && (
                  <div className="table-foot rel-table-foot-split">
                    <div className="rel-foot-item">
                      <span>Em aberto</span>
                      <span className="rel-table-total rel-total--danger">{fmtBRL(totalEmAberto)}</span>
                    </div>
                    <div className="rel-foot-item">
                      <span>Total pago</span>
                      <span className="rel-table-total rel-total--green">{fmtBRL(totalPago)}</span>
                    </div>
                    <div className="rel-foot-item">
                      <span>Total do período</span>
                      <span className="rel-table-total">{fmtBRL(totalContas)}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Relatorios;
