import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, X,
  CheckCircle, Trash2, Edit3, Wallet, CalendarRange, CreditCard,
} from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import {
  getAll, update, deleteConta, baixaParcela, baixaConta,
  type ContaAPagarDTO, type ContaAPagarUpdateDTO,
} from '../../Services/contaAPagarService';
import { getAll as getDespesas, type DespesaDTO } from '../../Services/despesaService';
import '../../Styles/Admin/contaAPagar.css';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const isoToInput = (iso: string) => iso.split('T')[0];
const isoToday   = () => new Date().toISOString().split('T')[0];
const isoFirst   = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

interface ContaGroup {
  contaId: number;
  nomeDespesa: string;
  despesaId: number;
  totalParcelas: number;
  parcelasPagas: number;
  valorTotal: number;
  dataAbertura: string;
  proxVencimento?: string;
  parcelas: ContaAPagarDTO[];
}

function groupContas(parcelas: ContaAPagarDTO[]): ContaGroup[] {
  const map = new Map<number, ContaAPagarDTO[]>();
  parcelas.forEach(p => {
    const list = map.get(p.contaId) ?? [];
    list.push(p);
    map.set(p.contaId, list);
  });
  return Array.from(map.entries()).map(([contaId, ps]) => {
    const sorted   = [...ps].sort((a, b) => a.numeroParcela - b.numeroParcela);
    const emAberto = sorted.filter(p => !p.pago);
    return {
      contaId,
      nomeDespesa:   ps[0].nomeDespesa,
      despesaId:     ps[0].despesaId,
      totalParcelas: ps[0].totalParcelas,
      parcelasPagas: ps.filter(p => p.pago).length,
      valorTotal:    ps[0].valorTotal,
      dataAbertura:  ps[0].dataAbertura,
      proxVencimento: emAberto[0]?.dataVencimento,
      parcelas: sorted,
    };
  }).sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());
}

interface ParcelaEdit { valor: string; data: string; }

/** Modo de abertura do modal: 'edit' = edição completa | 'baixa' = somente dar baixa */
type ModalMode = 'edit' | 'baixa';

const ContaAPagar: React.FC = () => {
  const navigate = useNavigate();

  const [todas,    setTodas]    = useState<ContaAPagarDTO[]>([]);
  const [despesas, setDespesas] = useState<DespesaDTO[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const [filtroStatus,  setFiltroStatus]  = useState<'todos' | 'aberto' | 'pago'>('todos');
  const [filtroDespesa, setFiltroDespesa] = useState<string>('');
  const [periodoInicio, setPeriodoInicio] = useState(isoFirst());
  const [periodoFim,    setPeriodoFim]    = useState(isoToday());

  const [detalhe,             setDetalhe]             = useState<ContaGroup | null>(null);
  const [modalMode,           setModalMode]           = useState<ModalMode>('edit');
  const [edits,               setEdits]               = useState<Record<number, ParcelaEdit>>({});
  const [saving,              setSaving]              = useState<number | null>(null);
  const [confirmDeleteConta,  setConfirmDeleteConta]  = useState(false);

  /* ── carregar ───────────────────────────────────────────────────────── */
  const carregar = async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([getAll(), getDespesas()]);
      setTodas(p);
      setDespesas(d);
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  /* ── grupos e filtros ────────────────────────────────────────────────── */
  const grupos = groupContas(todas);

  const filtered = grupos.filter(g => {
    const matchSearch  = g.nomeDespesa.toLowerCase().includes(search.toLowerCase());
    const matchDespesa = filtroDespesa ? g.despesaId === parseInt(filtroDespesa) : true;

    // filtro de status
    const matchStatus =
      filtroStatus === 'todos' ? true
      : filtroStatus === 'pago'  ? g.parcelasPagas > 0          // qualquer parcela paga
      : g.parcelasPagas === 0;                                   // nenhuma parcela paga

    // filtro de período: alguma parcela vence dentro do período
    const inicio = periodoInicio ? new Date(`${periodoInicio}T00:00:00`) : null;
    const fim    = periodoFim    ? new Date(`${periodoFim}T23:59:59`)    : null;
    const matchPeriodo = g.parcelas.some(p => {
      const d = new Date(p.dataVencimento);
      if (inicio && d < inicio) return false;
      if (fim    && d > fim)    return false;
      return true;
    });

    return matchSearch && matchDespesa && matchStatus && matchPeriodo;
  });

  /* ── abrir modal ─────────────────────────────────────────────────────── */
  const openModal = (g: ContaGroup, mode: ModalMode) => {
    const initEdits: Record<number, ParcelaEdit> = {};
    g.parcelas.forEach(p => {
      initEdits[p.contaAPagarId] = {
        valor: String(p.valorParcela),
        data:  isoToInput(p.dataVencimento),
      };
    });
    setEdits(initEdits);
    setConfirmDeleteConta(false);
    setModalMode(mode);
    setDetalhe(g);
  };

  /* ── salvar parcela ──────────────────────────────────────────────────── */
  const handleSaveParcela = async (id: number) => {
    const e = edits[id];
    if (!e) return;
    setSaving(id);
    try {
      const dto: ContaAPagarUpdateDTO = {
        valorParcela:   parseFloat(e.valor) || undefined,
        dataVencimento: e.data ? new Date(e.data).toISOString() : undefined,
      };
      await update(id, dto);
      await carregar();
      setDetalhe(prev => prev ? {
        ...prev,
        parcelas: prev.parcelas.map(p =>
          p.contaAPagarId === id
            ? { ...p, valorParcela: parseFloat(e.valor), dataVencimento: new Date(e.data).toISOString() }
            : p
        ),
      } : null);
    } catch { /* silently ignore */ }
    finally { setSaving(null); }
  };

  /* ── dar baixa em parcela ────────────────────────────────────────────── */
  const handleBaixa = async (id: number) => {
    setSaving(id);
    try {
      await baixaParcela(id);
      await carregar();
      setDetalhe(prev => prev ? {
        ...prev,
        parcelasPagas: prev.parcelasPagas + 1,
        parcelas: prev.parcelas.map(p =>
          p.contaAPagarId === id
            ? { ...p, pago: true, dataPagamento: new Date().toISOString() }
            : p
        ),
      } : null);
    } catch { /* silently ignore */ }
    finally { setSaving(null); }
  };

  const handleBaixaConta = async () => {
    if (!detalhe) return;
    setSaving(-1);
    try {
      await baixaConta(detalhe.contaId);
      await carregar();
      setDetalhe(null);
    } catch { /* silently ignore */ }
    finally { setSaving(null); }
  };

  const handleDeleteConta = async () => {
    if (!detalhe) return;
    setSaving(-2);
    try {
      await deleteConta(detalhe.contaId);
      await carregar();
      setDetalhe(null);
    } catch { /* silently ignore */ }
    finally { setSaving(null); setConfirmDeleteConta(false); }
  };

  /* ── totais ──────────────────────────────────────────────────────────── */
  const totalEmAberto = todas.filter(p => !p.pago).reduce((acc, p) => acc + p.valorParcela, 0);
  const totalPago     = todas.filter(p =>  p.pago).reduce((acc, p) => acc + p.valorParcela, 0);

  return (
    <div className="admin-shell">
      <SideBar />

      <main className="main">
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Contas a Pagar</b>
          </div>
        </div>

        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">Financeiro</p>
              <h1 className="page-title">Contas a Pagar</h1>
              <p className="page-sub">
                Gerencie suas contas parceladas e acompanhe os vencimentos.
              </p>
            </div>
            <button className="btn-primary red" onClick={() => navigate('/contas-a-pagar/nova')}>
              <Plus size={16} strokeWidth={2.5} />
              Nova Conta
            </button>
          </div>

          {/* ---- Summary ---- */}
          <div className="conta-summary">
            <div className="conta-stat-card">
              <div className="conta-stat-icon"><Wallet size={20} strokeWidth={1.8} /></div>
              <div>
                <p className="conta-stat-label">Contas lançadas</p>
                <p className="conta-stat-value">{grupos.length}</p>
              </div>
            </div>
            <div className="conta-stat-card conta-stat-card--danger">
              <div className="conta-stat-icon conta-stat-icon--danger"><Wallet size={20} strokeWidth={1.8} /></div>
              <div>
                <p className="conta-stat-label">Em aberto</p>
                <p className="conta-stat-value conta-stat-brl">{fmtBRL(totalEmAberto)}</p>
              </div>
            </div>
            <div className="conta-stat-card conta-stat-card--green">
              <div className="conta-stat-icon conta-stat-icon--green"><CheckCircle size={20} strokeWidth={1.8} /></div>
              <div>
                <p className="conta-stat-label">Total pago</p>
                <p className="conta-stat-value conta-stat-brl">{fmtBRL(totalPago)}</p>
              </div>
            </div>
          </div>

          {/* ---- Filtros ---- */}
          <div className="conta-filters">
            {/* Despesa */}
            <select
              className="conta-filter-select"
              value={filtroDespesa}
              onChange={e => setFiltroDespesa(e.target.value)}
            >
              <option value="">Todas as despesas</option>
              {despesas.map(d => (
                <option key={d.despesaId} value={d.despesaId}>{d.nomeDespesa}</option>
              ))}
            </select>

            {/* Status chips */}
            <div className="conta-status-chips">
              {(['todos', 'aberto', 'pago'] as const).map(s => (
                <button
                  key={s}
                  className={`chip${filtroStatus === s ? ' active' : ''}`}
                  onClick={() => setFiltroStatus(s)}
                >
                  {s === 'todos' ? 'Todos' : s === 'aberto' ? 'Em aberto' : 'Com baixa'}
                </button>
              ))}
            </div>

            {/* Período */}
            <div className="conta-period-bar">
              <CalendarRange size={14} strokeWidth={1.8} color="var(--fg-mute)" />
              <div className="conta-period-field">
                <label>De</label>
                <input
                  type="date"
                  value={periodoInicio}
                  onChange={e => setPeriodoInicio(e.target.value)}
                />
              </div>
              <span className="conta-period-sep">—</span>
              <div className="conta-period-field">
                <label>Até</label>
                <input
                  type="date"
                  value={periodoFim}
                  onChange={e => setPeriodoFim(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ---- Table ---- */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-search">
                <Search size={14} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  placeholder="Filtrar por despesa…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--fg-mute)' }}>
                {filtered.length} conta{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Despesa</th>
                  <th>Parcelas</th>
                  <th>Valor Total</th>
                  <th>Prox. Vencimento</th>
                  <th>Abertura</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--fg-mute)', fontSize: 12 }}>
                      Carregando…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--fg-soft)', fontSize: 12 }}>
                      Nenhuma conta encontrada
                    </td>
                  </tr>
                )}
                {!loading && filtered.map(g => {
                  const quitada     = g.parcelasPagas === g.totalParcelas;
                  const temBaixa    = g.parcelasPagas > 0;
                  return (
                    <tr key={g.contaId} className="row">
                      <td>
                        <div className="conta-nome-cell">
                          <div className={`conta-dot${quitada ? ' conta-dot--green' : temBaixa ? ' conta-dot--amber' : ''}`} />
                          <span>{g.nomeDespesa}</span>
                        </div>
                      </td>
                      <td>
                        <span className="conta-parcela-badge">
                          {g.parcelasPagas}/{g.totalParcelas}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, letterSpacing: '.02em', color: 'var(--ink)' }}>
                          {fmtBRL(g.valorTotal)}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: g.proxVencimento ? 'var(--fg-2)' : 'var(--fg-soft)' }}>
                        {g.proxVencimento ? fmtDate(g.proxVencimento) : '—'}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--fg-mute)' }}>
                        {fmtDate(g.dataAbertura)}
                      </td>
                      <td>
                        <span className={`conta-status ${quitada ? 'pago' : temBaixa ? 'parcial' : 'aberto'}`}>
                          {quitada
                            ? 'Quitada'
                            : temBaixa
                              ? `${g.parcelasPagas}/${g.totalParcelas} pagas`
                              : `${g.totalParcelas} em aberto`}
                        </span>
                      </td>
                      <td className="actions">
                        <div className="row-actions">
                          {/* Botão de dar baixa */}
                          {!quitada && (
                            <button
                              className="btn-icon"
                              title="Dar baixa"
                              onClick={() => openModal(g, 'baixa')}
                            >
                              <CreditCard size={15} strokeWidth={1.8} />
                            </button>
                          )}
                          {/* Botão de editar */}
                          <button
                            className="btn-icon"
                            title="Editar parcelas"
                            onClick={() => openModal(g, 'edit')}
                          >
                            <Edit3 size={15} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="table-foot">
              <span>{filtered.length} de {grupos.length} conta{grupos.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════════ Modal ══════════════════ */}
      {detalhe && (
        <div className="modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="modal conta-parcelas-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  {modalMode === 'baixa' ? 'Dar baixa · Conta' : 'Editar · Conta'} #{detalhe.contaId}
                </p>
                <h3>{detalhe.nomeDespesa}</h3>
              </div>
              <button className="modal-close" onClick={() => setDetalhe(null)}>
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* ── Resumo da conta ── */}
            <div className="conta-modal-summary">
              <div className="conta-modal-stat">
                <span>Total</span>
                <b>{fmtBRL(detalhe.valorTotal)}</b>
              </div>
              <div className="conta-modal-stat">
                <span>Parcelas pagas</span>
                <b className="green">{detalhe.parcelasPagas}/{detalhe.totalParcelas}</b>
              </div>
              <div className="conta-modal-stat">
                <span>Restante</span>
                <b className="red">
                  {fmtBRL(
                    detalhe.parcelas
                      .filter(p => !p.pago)
                      .reduce((a, p) => a + p.valorParcela, 0)
                  )}
                </b>
              </div>
            </div>

            <div className="conta-parcelas-list">
              {detalhe.parcelas.map(p => (
                <div key={p.contaAPagarId} className={`conta-parcela-row${p.pago ? ' pago' : ''}`}>
                  <div className="conta-parcela-num">
                    {p.numeroParcela}/{p.totalParcelas}
                  </div>

                  {/* ── Modo edição: campos de data e valor ── */}
                  {modalMode === 'edit' ? (
                    <div className="conta-parcela-fields">
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Vencimento</label>
                        <input
                          type="date"
                          disabled={p.pago}
                          value={edits[p.contaAPagarId]?.data ?? isoToInput(p.dataVencimento)}
                          onChange={e => setEdits(prev => ({
                            ...prev,
                            [p.contaAPagarId]: { ...prev[p.contaAPagarId], data: e.target.value },
                          }))}
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Valor (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          disabled={p.pago}
                          value={edits[p.contaAPagarId]?.valor ?? String(p.valorParcela)}
                          onChange={e => setEdits(prev => ({
                            ...prev,
                            [p.contaAPagarId]: { ...prev[p.contaAPagarId], valor: e.target.value },
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    /* ── Modo baixa: info resumida ── */
                    <div className="conta-baixa-info">
                      <p className="conta-baixa-venc">
                        Vencimento: <b>{fmtDate(p.dataVencimento)}</b>
                      </p>
                      <p className="conta-baixa-valor">{fmtBRL(p.valorParcela)}</p>
                    </div>
                  )}

                  {/* ── Ações da parcela ── */}
                  <div className="conta-parcela-actions">
                    {p.pago ? (
                      <div className="conta-parcela-pago-info">
                        <span className="conta-status pago" style={{ fontSize: 11, padding: '4px 10px' }}>
                          <CheckCircle size={12} strokeWidth={2} /> Pago
                        </span>
                        {p.dataPagamento && (
                          <small style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, color: 'var(--fg-soft)', marginTop: 3, display: 'block', textAlign: 'center' }}>
                            {fmtDate(p.dataPagamento)}
                          </small>
                        )}
                      </div>
                    ) : modalMode === 'edit' ? (
                      <>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => handleSaveParcela(p.contaAPagarId)}
                          disabled={saving === p.contaAPagarId}
                        >
                          {saving === p.contaAPagarId ? '…' : 'Salvar'}
                        </button>
                        <button
                          className="btn-primary red btn-sm"
                          onClick={() => handleBaixa(p.contaAPagarId)}
                          disabled={saving === p.contaAPagarId}
                          title="Dar baixa nesta parcela"
                        >
                          Baixar
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-primary red btn-sm conta-baixa-btn"
                        onClick={() => handleBaixa(p.contaAPagarId)}
                        disabled={saving === p.contaAPagarId}
                      >
                        {saving === p.contaAPagarId ? '…' : (
                          <><CheckCircle size={13} strokeWidth={2} /> Baixar</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              {modalMode === 'edit' && (
                confirmDeleteConta ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--fg-mute)' }}>Excluir toda a conta?</span>
                    <button
                      className="btn-primary red btn-sm"
                      onClick={handleDeleteConta}
                      disabled={saving === -2}
                    >
                      Confirmar
                    </button>
                    <button className="btn-ghost btn-sm" onClick={() => setConfirmDeleteConta(false)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-ghost btn-sm btn-danger"
                    onClick={() => setConfirmDeleteConta(true)}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                    Excluir Conta
                  </button>
                )
              )}

              {modalMode === 'baixa' && <div />}

              <div className="modal-actions-right">
                {detalhe.parcelasPagas < detalhe.totalParcelas && (
                  <button
                    className="btn-ghost btn-sm"
                    onClick={handleBaixaConta}
                    disabled={saving === -1}
                  >
                    {saving === -1 ? '…' : 'Quitar Todas'}
                  </button>
                )}
                <button className="btn-ghost btn-sm" onClick={() => setDetalhe(null)}>
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContaAPagar;
