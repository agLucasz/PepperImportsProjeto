import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart, Package, TrendingUp, Wallet,
  AlertTriangle, Clock, Download, ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../Components/Admin/SideBar';
import { getAll as getVendas,  type VendaDTO }        from '../../Services/vendaService';
import { getAll as getProdutos, type ProdutoDTO }      from '../../Services/produtoService';
import { getAll as getContas,  type ContaAPagarDTO }   from '../../Services/contaAPagarService';
import { gerarPDFVendas, gerarPDFContas }              from '../../Utils/gerarPDF';
import '../../Styles/Admin/dashboard.css';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const isoToday  = () => new Date().toISOString().split('T')[0];
const isoFirst  = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]; };
const isoInDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };

const inMonth = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

/* mini spark — últimos 6 meses (índice 0 = mais antigo, 5 = atual) */
function buildSpark(vendas: VendaDTO[]): number[] {
  const buckets = Array(6).fill(0) as number[];
  const now = new Date();
  vendas.forEach(v => {
    if (!v.dataVenda) return;
    const d = new Date(v.dataVenda);
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diff >= 0 && diff < 6) buckets[5 - diff] += v.valorVenda;
  });
  return buckets;
}

const MESES_CURTOS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

/* ══════════════════════════════════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [vendas,   setVendas]   = useState<VendaDTO[]>([]);
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [contas,   setContas]   = useState<ContaAPagarDTO[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [v, p, c] = await Promise.all([getVendas(), getProdutos(), getContas()]);
        setVendas(v);
        setProdutos(p);
        setContas(c);
      } catch { /* silently ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  /* ── KPIs do mês ─────────────────────────────────────────────────────── */
  const vendasMes      = useMemo(() => vendas.filter(v => inMonth(v.dataVenda)),   [vendas]);
  const faturamentoMes = useMemo(() => vendasMes.reduce((a, v) => a + v.valorVenda, 0), [vendasMes]);
  const totalProdutos  = useMemo(() => produtos.filter(p => p.ativo).length, [produtos]);
  const contasAberto   = useMemo(() => contas.filter(c => !c.pago).reduce((a, c) => a + c.valorParcela, 0), [contas]);

  /* ── Produto mais vendido ────────────────────────────────────────────── */
  const topProdutos = useMemo(() => {
    const map = new Map<number, { nome: string; qtd: number; receita: number }>();
    vendas.forEach(v =>
      v.itens.forEach(i => {
        const prev = map.get(i.produtoId) ?? { nome: i.nomeProduto, qtd: 0, receita: 0 };
        map.set(i.produtoId, {
          nome: i.nomeProduto,
          qtd: prev.qtd + i.quantidadeItem,
          receita: prev.receita + (i.valorItem ?? 0) * i.quantidadeItem,
        });
      })
    );
    return Array.from(map.values()).sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  }, [vendas]);

  /* ── Contas vencidas / a vencer em 30 dias ───────────────────────────── */
  const hoje30 = isoInDays(30);
  const contasVencidas  = useMemo(() =>
    contas.filter(c => !c.pago && c.dataVencimento < isoToday()),
  [contas]);
  const contasAVencer   = useMemo(() =>
    contas.filter(c => !c.pago && c.dataVencimento >= isoToday() && c.dataVencimento <= hoje30),
  [contas]);

  /* ── Spark ───────────────────────────────────────────────────────────── */
  const spark = useMemo(() => buildSpark(vendas), [vendas]);
  const sparkMax = Math.max(...spark, 1);
  const now = new Date();
  const sparkLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return MESES_CURTOS[d.getMonth()];
  });

  /* ── Últimas vendas ──────────────────────────────────────────────────── */
  const ultimasVendas = useMemo(() =>
    [...vendas].sort((a, b) =>
      new Date(b.dataVenda ?? 0).getTime() - new Date(a.dataVenda ?? 0).getTime()
    ).slice(0, 5),
  [vendas]);

  /* ── handlers de PDF ─────────────────────────────────────────────────── */
  const baixarVendasMes  = () => gerarPDFVendas(vendasMes,  isoFirst(), isoToday());
  const baixarContasMes  = () => gerarPDFContas(
    contas.filter(c => c.dataVencimento >= isoFirst() && c.dataVencimento <= isoToday()),
    isoFirst(), isoToday(),
  );
  const baixarVencidas   = () => gerarPDFContas(contasVencidas,  '', isoToday());
  const baixarAVencer    = () => gerarPDFContas(contasAVencer,   isoToday(), hoje30);

  /* ── Greeting ─────────────────────────────────────────────────────────── */
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const raw  = localStorage.getItem('pepper_user');
  const user = raw ? (JSON.parse(raw) as { nome: string }) : { nome: 'Admin' };
  const firstName = user.nome.split(' ')[0];

  return (
    <div className="admin-shell">
      <SideBar />

      <main className="main">
        {/* ── Topbar ── */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Dashboard</b>
          </div>
        </div>

        <div className="page">
          {/* ── Greeting ── */}
          <div className="dash-greeting">
            <div>
              <p className="page-eyebrow">Visão Geral</p>
              <h1 className="page-title">
                {saudacao}, <span className="red">{firstName}</span>
              </h1>
              <p className="page-sub">
                Aqui está o resumo de hoje — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.
              </p>
            </div>
          </div>

          {/* ══ KPI CARDS ══ */}
          <div className="kpi-grid">
            {/* Vendas no mês */}
            <div className="kpi feature">
              <p className="kpi-label">
                <ShoppingCart size={13} strokeWidth={2} />
                Vendas no mês
              </p>
              <p className="kpi-value">{loading ? '—' : vendasMes.length}</p>
              <div className="kpi-spark">
                {spark.map((v, i) => (
                  <i
                    key={i}
                    className={i === 5 ? 'hot' : ''}
                    style={{ height: `${Math.round((v / sparkMax) * 100)}%` }}
                    title={`${sparkLabels[i]}: ${fmtBRL(v)}`}
                  />
                ))}
              </div>
              <p className="kpi-foot">Últimos 6 meses</p>
            </div>

            {/* Faturamento */}
            <div className="kpi">
              <p className="kpi-label">
                <TrendingUp size={13} strokeWidth={2} />
                Faturamento do mês
              </p>
              <p className="kpi-value kpi-value--brl">
                {loading ? '—' : fmtBRL(faturamentoMes)}
              </p>
              <p className="kpi-foot">
                {vendasMes.length > 0
                  ? `Ticket médio ${fmtBRL(faturamentoMes / vendasMes.length)}`
                  : 'Sem vendas no mês'}
              </p>
            </div>

            {/* Total de produtos */}
            <div className="kpi">
              <p className="kpi-label">
                <Package size={13} strokeWidth={2} />
                Produtos ativos
              </p>
              <p className="kpi-value">{loading ? '—' : totalProdutos}</p>
              <p className="kpi-foot">
                {produtos.filter(p => !p.ativo).length} inativos no catálogo
              </p>
            </div>

            {/* Contas em aberto */}
            <div className={`kpi${contasAberto > 0 ? ' kpi--danger' : ''}`}>
              <p className="kpi-label">
                <Wallet size={13} strokeWidth={2} />
                Contas em aberto
              </p>
              <p className="kpi-value kpi-value--brl">
                {loading ? '—' : fmtBRL(contasAberto)}
              </p>
              <p className="kpi-foot">
                {contas.filter(c => !c.pago).length} parcela{contas.filter(c => !c.pago).length !== 1 ? 's' : ''} pendente{contas.filter(c => !c.pago).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* ══ GRID PRINCIPAL: 2 colunas flex independentes ══ */}
          <div className="dash-main-grid">

            {/* ════ COLUNA ESQUERDA — Produtos + Últimas vendas ════ */}
            <div className="dash-left-col">

              {/* Produtos mais vendidos */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Ranking</p>
                    <h3>Produtos mais vendidos</h3>
                  </div>
                  <button className="btn-ghost btn-sm" onClick={() => navigate('/pdv')}>
                    Ver vendas
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
                {loading && <p className="dash-empty">Carregando…</p>}
                {!loading && topProdutos.length === 0 && (
                  <p className="dash-empty">Nenhuma venda registrada</p>
                )}
                {!loading && topProdutos.map((p, idx) => (
                  <div key={p.nome} className="list-row">
                    <span className="list-rank">#{idx + 1}</span>
                    <div className="list-thumb">
                      <Package size={22} strokeWidth={1.4} color="var(--fg-soft)" />
                    </div>
                    <div className="list-info">
                      <b>{p.nome}</b>
                      <small>{p.qtd} unidades vendidas</small>
                    </div>
                    <div className="list-meta">
                      {fmtBRL(p.receita)}
                      <small>receita</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Últimas vendas */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Atividade recente</p>
                    <h3>Últimas vendas</h3>
                  </div>
                  <button className="btn-ghost btn-sm" onClick={() => navigate('/pdv')}>
                    Ver todas
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
                {loading && <p className="dash-empty">Carregando…</p>}
                {!loading && ultimasVendas.length === 0 && (
                  <p className="dash-empty">Nenhuma venda registrada</p>
                )}
                {!loading && ultimasVendas.length > 0 && (
                  <table className="dash-mini-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produtos</th>
                        <th>Total</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimasVendas.map(v => (
                        <tr key={v.vendaId}>
                          <td className="mono">#{v.vendaId}</td>
                          <td>
                            <div className="dash-chips">
                              {v.itens.slice(0, 2).map(i => (
                                <span key={i.vendaItemId} className="picker-chip">
                                  {i.nomeProduto} ×{i.quantidadeItem}
                                </span>
                              ))}
                              {v.itens.length > 2 && <span className="picker-chip">+{v.itens.length - 2}</span>}
                            </div>
                          </td>
                          <td className="dash-mini-total">{fmtBRL(v.valorVenda)}</td>
                          <td className="dash-mini-date">{v.dataVenda ? fmtDate(v.dataVenda) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>{/* /dash-left-col */}

            {/* ════ COLUNA DIREITA — Alertas + Relatórios ════ */}
            <div className="dash-right-col">

              {/* Contas vencidas */}
              <div className={`card dash-alert-card${contasVencidas.length > 0 ? ' dash-alert-card--danger' : ''}`}>
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Financeiro</p>
                    <h3 className="dash-alert-title">
                      <AlertTriangle size={16} strokeWidth={2} />
                      Contas vencidas
                    </h3>
                  </div>
                  <span className="dash-alert-badge dash-alert-badge--danger">
                    {contasVencidas.length}
                  </span>
                </div>
                {contasVencidas.length === 0 ? (
                  <p className="dash-alert-ok">Nenhuma conta vencida</p>
                ) : (
                  <div className="dash-alert-list">
                    {contasVencidas.slice(0, 4).map(c => (
                      <div key={c.contaAPagarId} className="dash-alert-item">
                        <div>
                          <p className="dash-alert-item-nome">{c.nomeDespesa}</p>
                          <p className="dash-alert-item-data">Venceu em {fmtDate(c.dataVencimento)}</p>
                        </div>
                        <span className="dash-alert-item-valor">{fmtBRL(c.valorParcela)}</span>
                      </div>
                    ))}
                    {contasVencidas.length > 4 && (
                      <p className="dash-alert-more">+{contasVencidas.length - 4} mais</p>
                    )}
                  </div>
                )}
                {contasVencidas.length > 0 && (
                  <button className="dash-alert-download" onClick={baixarVencidas}>
                    <Download size={13} strokeWidth={2} />
                    Baixar relatório
                  </button>
                )}
              </div>

              {/* A vencer */}
              <div className={`card dash-alert-card${contasAVencer.length > 0 ? ' dash-alert-card--amber' : ''}`}>
                <div className="card-head">
                  <div>
                    <p className="eyebrow">Próximos 30 dias</p>
                    <h3 className="dash-alert-title">
                      <Clock size={16} strokeWidth={2} />
                      A vencer
                    </h3>
                  </div>
                  <span className="dash-alert-badge dash-alert-badge--amber">
                    {contasAVencer.length}
                  </span>
                </div>
                {contasAVencer.length === 0 ? (
                  <p className="dash-alert-ok">Nenhuma conta nos próximos 30 dias</p>
                ) : (
                  <div className="dash-alert-list">
                    {contasAVencer.slice(0, 4).map(c => (
                      <div key={c.contaAPagarId} className="dash-alert-item">
                        <div>
                          <p className="dash-alert-item-nome">{c.nomeDespesa}</p>
                          <p className="dash-alert-item-data">Vence em {fmtDate(c.dataVencimento)}</p>
                        </div>
                        <span className="dash-alert-item-valor">{fmtBRL(c.valorParcela)}</span>
                      </div>
                    ))}
                    {contasAVencer.length > 4 && (
                      <p className="dash-alert-more">+{contasAVencer.length - 4} mais</p>
                    )}
                  </div>
                )}
                {contasAVencer.length > 0 && (
                  <button className="dash-alert-download" onClick={baixarAVencer}>
                    <Download size={13} strokeWidth={2} />
                    Baixar relatório
                  </button>
                )}
              </div>

            </div>{/* /dash-right-col */}

          </div>{/* /dash-main-grid */}

          {/* ══ RELATÓRIOS — faixa horizontal completa ══ */}
          <div className="dash-reports-row">
            <p className="dash-reports-label">Baixar relatórios</p>
            <div className="dash-reports-grid">
              <button className="dash-report-card" onClick={baixarVendasMes} disabled={loading}>
                <div className="dash-report-icon"><ShoppingCart size={18} strokeWidth={1.8} /></div>
                <div className="dash-report-info">
                  <b>Vendas do mês</b>
                  <small>{vendasMes.length} venda{vendasMes.length !== 1 ? 's' : ''} · {fmtBRL(faturamentoMes)}</small>
                </div>
                <Download size={15} strokeWidth={2} className="dash-report-dl" />
              </button>
              <button className="dash-report-card" onClick={baixarContasMes} disabled={loading}>
                <div className="dash-report-icon"><Wallet size={18} strokeWidth={1.8} /></div>
                <div className="dash-report-info">
                  <b>Contas do mês</b>
                  <small>
                    {contas.filter(c => c.dataVencimento >= isoFirst() && c.dataVencimento <= isoToday()).length} parcela{contas.filter(c => c.dataVencimento >= isoFirst() && c.dataVencimento <= isoToday()).length !== 1 ? 's' : ''}
                  </small>
                </div>
                <Download size={15} strokeWidth={2} className="dash-report-dl" />
              </button>
              <button className="dash-report-card dash-report-card--danger" onClick={baixarVencidas} disabled={loading || contasVencidas.length === 0}>
                <div className="dash-report-icon dash-report-icon--danger"><AlertTriangle size={18} strokeWidth={1.8} /></div>
                <div className="dash-report-info">
                  <b>Contas vencidas</b>
                  <small>{contasVencidas.length > 0 ? `${contasVencidas.length} pendente${contasVencidas.length !== 1 ? 's' : ''}` : 'Nenhuma pendência'}</small>
                </div>
                <Download size={15} strokeWidth={2} className="dash-report-dl" />
              </button>
              <button className="dash-report-card dash-report-card--amber" onClick={baixarAVencer} disabled={loading || contasAVencer.length === 0}>
                <div className="dash-report-icon dash-report-icon--amber"><Clock size={18} strokeWidth={1.8} /></div>
                <div className="dash-report-info">
                  <b>A vencer (30 dias)</b>
                  <small>{contasAVencer.length > 0 ? `${contasAVencer.length} conta${contasAVencer.length !== 1 ? 's' : ''}` : 'Nenhuma a vencer'}</small>
                </div>
                <Download size={15} strokeWidth={2} className="dash-report-dl" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
