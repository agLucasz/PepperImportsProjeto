import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, CheckCircle, Trash2 } from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import {
  getAll, create, update, baixaParcela, baixaConta, deleteConta,
  type ContaAPagarDTO, type ContaAPagarUpdateDTO,
} from '../../Services/contaAPagarService';
import { getAll as getDespesas, type DespesaDTO } from '../../Services/despesaService';
import '../../Styles/Admin/contaAPagar.css';

const isoToInput = (iso: string) => iso.split('T')[0];

const today = () => new Date().toISOString().split('T')[0];

interface ParcelaEdit {
  valor: string;
  data: string;
}

const AddContaAPagar: React.FC = () => {
  const navigate = useNavigate();

  const [despesas, setDespesas] = useState<DespesaDTO[]>([]);
  const [despesaSearch, setDespesaSearch] = useState('');
  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<DespesaDTO | null>(null);

  const [form, setForm] = useState({
    totalParcelas: '1',
    valorParcela: '',
    dataPrimeiroVencimento: today(),
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Post-save parcelas modal
  const [parcelas, setParcelas] = useState<ContaAPagarDTO[]>([]);
  const [showParcelasModal, setShowParcelasModal] = useState(false);
  const [edits, setEdits] = useState<Record<number, ParcelaEdit>>({});
  const [savingParcela, setSavingParcela] = useState<number | null>(null);
  const [confirmDeleteConta, setConfirmDeleteConta] = useState(false);
  const [currentContaId, setCurrentContaId] = useState<number | null>(null);

  useEffect(() => {
    getDespesas().then(setDespesas).catch(() => { /* silently ignore */ });
  }, []);

  const filteredDespesas = despesas.filter(d =>
    d.nomeDespesa.toLowerCase().includes(despesaSearch.toLowerCase())
  );

  const handleSelectDespesa = (d: DespesaDTO) => {
    setSelectedDespesa(d);
    setShowDespesaModal(false);
    setDespesaSearch('');
  };

  const handleSave = async () => {
    if (!selectedDespesa) { setFormError('Selecione uma despesa.'); return; }
    const totalParcelas = parseInt(form.totalParcelas);
    if (!totalParcelas || totalParcelas < 1) { setFormError('Total de parcelas deve ser maior que zero.'); return; }
    const valorParcela = parseFloat(form.valorParcela);
    if (!valorParcela || valorParcela <= 0) { setFormError('Informe um valor de parcela válido.'); return; }
    if (!form.dataPrimeiroVencimento) { setFormError('Informe a data do primeiro vencimento.'); return; }

    setSaving(true);
    setFormError('');
    try {
      await create({
        despesaId: selectedDespesa.despesaId,
        totalParcelas,
        valorParcela,
        dataPrimeiroVencimento: new Date(form.dataPrimeiroVencimento).toISOString(),
      });

      // Find the newly created conta
      const todas = await getAll();
      const byDespesa = todas.filter(p => p.despesaId === selectedDespesa.despesaId);
      const contaIds = [...new Set(byDespesa.map(p => p.contaId))];
      const newContaId = Math.max(...contaIds);
      const newParcelas = byDespesa
        .filter(p => p.contaId === newContaId)
        .sort((a, b) => a.numeroParcela - b.numeroParcela);

      const initEdits: Record<number, ParcelaEdit> = {};
      newParcelas.forEach(p => {
        initEdits[p.contaAPagarId] = {
          valor: String(p.valorParcela),
          data: isoToInput(p.dataVencimento),
        };
      });

      setCurrentContaId(newContaId);
      setParcelas(newParcelas);
      setEdits(initEdits);
      setConfirmDeleteConta(false);
      setShowParcelasModal(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao lançar conta.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveParcela = async (id: number) => {
    const e = edits[id];
    if (!e) return;
    setSavingParcela(id);
    try {
      const dto: ContaAPagarUpdateDTO = {
        valorParcela: parseFloat(e.valor) || undefined,
        dataVencimento: e.data ? new Date(e.data).toISOString() : undefined,
      };
      await update(id, dto);
      setParcelas(prev => prev.map(p =>
        p.contaAPagarId === id
          ? { ...p, valorParcela: parseFloat(e.valor), dataVencimento: new Date(e.data).toISOString() }
          : p
      ));
    } catch { /* silently ignore */ }
    finally { setSavingParcela(null); }
  };

  const handleBaixa = async (id: number) => {
    setSavingParcela(id);
    try {
      await baixaParcela(id);
      setParcelas(prev => prev.map(p =>
        p.contaAPagarId === id ? { ...p, pago: true, dataPagamento: new Date().toISOString() } : p
      ));
    } catch { /* silently ignore */ }
    finally { setSavingParcela(null); }
  };

  const handleBaixaConta = async () => {
    if (!currentContaId) return;
    setSavingParcela(-1);
    try {
      await baixaConta(currentContaId);
      setParcelas(prev => prev.map(p => ({ ...p, pago: true, dataPagamento: new Date().toISOString() })));
    } catch { /* silently ignore */ }
    finally { setSavingParcela(null); }
  };

  const handleDeleteConta = async () => {
    if (!currentContaId) return;
    setSavingParcela(-2);
    try {
      await deleteConta(currentContaId);
      setShowParcelasModal(false);
      navigate('/contas-a-pagar');
    } catch { /* silently ignore */ }
    finally { setSavingParcela(null); setConfirmDeleteConta(false); }
  };

  const parcelasPagas = parcelas.filter(p => p.pago).length;

  return (
    <div className="admin-shell">
      <SideBar />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/contas-a-pagar')}>
              Contas a Pagar
            </span>
            <span className="sep">/</span>
            <b>Nova Conta</b>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <button className="page-back" onClick={() => navigate('/contas-a-pagar')}>
            <ArrowLeft size={14} strokeWidth={2} />
            Voltar para Contas a Pagar
          </button>

          <div className="page-head">
            <div>
              <p className="page-eyebrow">Financeiro</p>
              <h1 className="page-title">Nova Conta</h1>
              <p className="page-sub">
                Preencha os dados para lançar uma nova conta a pagar.
              </p>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 860 }}>
            {/* ---- Form ---- */}
            <div className="form-section">
              <h3>Dados da Conta</h3>
              <p className="hint">Preencha os campos para lançar a conta e gerar as parcelas automaticamente.</p>

              {/* Despesa picker */}
              <div className="field">
                <label>Despesa <span className="req">*</span></label>
                <button
                  className="picker-btn"
                  type="button"
                  onClick={() => setShowDespesaModal(true)}
                  onKeyDown={e => e.key === 'Enter' && setShowDespesaModal(true)}
                >
                  {selectedDespesa ? (
                    <span className="picker-chips">
                      <span className="picker-chip">{selectedDespesa.nomeDespesa}</span>
                    </span>
                  ) : (
                    <span className="placeholder">Selecione uma despesa…</span>
                  )}
                  <Search size={14} strokeWidth={1.8} color="var(--fg-mute)" />
                </button>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Total de Parcelas <span className="req">*</span></label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Ex: 3"
                    value={form.totalParcelas}
                    onChange={e => setForm(f => ({ ...f, totalParcelas: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Valor por Parcela <span className="req">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 500,00"
                    value={form.valorParcela}
                    onChange={e => setForm(f => ({ ...f, valorParcela: e.target.value }))}
                  />
                </div>
              </div>

              <div className="field">
                <label>1º Vencimento <span className="req">*</span></label>
                <input
                  type="date"
                  value={form.dataPrimeiroVencimento}
                  onChange={e => setForm(f => ({ ...f, dataPrimeiroVencimento: e.target.value }))}
                />
              </div>

              {formError && <p className="modal-error" style={{ marginBottom: 16 }}>{formError}</p>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => navigate('/contas-a-pagar')}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary red"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Lançando…' : 'Lançar Conta'}
                </button>
              </div>
            </div>

            {/* ---- Preview ---- */}
            <div className="form-section">
              <h3>Resumo</h3>
              <p className="hint">Visualização do que será gerado ao lançar.</p>

              <div className="conta-preview">
                <div className="conta-preview-row">
                  <span>Despesa</span>
                  <b>{selectedDespesa?.nomeDespesa ?? '—'}</b>
                </div>
                <div className="conta-preview-row">
                  <span>Parcelas</span>
                  <b>{form.totalParcelas || '—'}</b>
                </div>
                <div className="conta-preview-row">
                  <span>Valor / parcela</span>
                  <b>{form.valorParcela ? `R$ ${parseFloat(form.valorParcela || '0').toFixed(2)}` : '—'}</b>
                </div>
                <div className="conta-preview-row conta-preview-total">
                  <span>Total</span>
                  <b>
                    {form.valorParcela && form.totalParcelas
                      ? `R$ ${(parseFloat(form.valorParcela) * parseInt(form.totalParcelas)).toFixed(2)}`
                      : '—'}
                  </b>
                </div>
                <div className="conta-preview-row">
                  <span>1º Vencimento</span>
                  <b>
                    {form.dataPrimeiroVencimento
                      ? new Date(form.dataPrimeiroVencimento).toLocaleDateString('pt-BR')
                      : '—'}
                  </b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---- Despesa Picker Modal ---- */}
      {showDespesaModal && (
        <div className="modal-overlay" onClick={() => setShowDespesaModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">Seleção</p>
                <h3>Despesa</h3>
              </div>
              <button className="modal-close" onClick={() => setShowDespesaModal(false)}>
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="table-search" style={{ borderRadius: 10 }}>
              <Search size={14} strokeWidth={1.8} color="var(--fg-mute)" />
              <input
                autoFocus
                placeholder="Buscar despesa…"
                value={despesaSearch}
                onChange={e => setDespesaSearch(e.target.value)}
              />
            </div>

            <div className="cat-pick-list">
              {filteredDespesas.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--fg-soft)', textAlign: 'center', padding: '16px 0' }}>
                  Nenhuma despesa encontrada.
                </p>
              )}
              {filteredDespesas.map(d => (
                <button
                  key={d.despesaId}
                  className={`cat-pick-item${selectedDespesa?.despesaId === d.despesaId ? ' selected' : ''}`}
                  onClick={() => handleSelectDespesa(d)}
                >
                  <div className="cat-pick-check" />
                  {d.nomeDespesa}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <div className="modal-actions-right">
                <button className="btn-ghost btn-sm" onClick={() => setShowDespesaModal(false)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Parcelas Modal (pós-lançamento) ---- */}
      {showParcelasModal && (
        <div className="modal-overlay">
          <div className="modal conta-parcelas-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--green)' }}>
                  ✓ Conta lançada com sucesso
                </p>
                <h3>{selectedDespesa?.nomeDespesa}</h3>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: -8 }}>
              Revise e ajuste as datas ou valores de cada parcela antes de concluir.
            </p>

            <div className="conta-parcelas-list">
              {parcelas.map(p => (
                <div key={p.contaAPagarId} className={`conta-parcela-row${p.pago ? ' pago' : ''}`}>
                  <div className="conta-parcela-num">
                    {p.numeroParcela}/{p.totalParcelas}
                  </div>

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

                  <div className="conta-parcela-actions">
                    {p.pago ? (
                      <span className="conta-status pago" style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle size={12} strokeWidth={2} /> Pago
                      </span>
                    ) : (
                      <>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => handleSaveParcela(p.contaAPagarId)}
                          disabled={savingParcela === p.contaAPagarId}
                        >
                          {savingParcela === p.contaAPagarId ? '…' : 'Salvar'}
                        </button>
                        <button
                          className="btn-primary red btn-sm"
                          onClick={() => handleBaixa(p.contaAPagarId)}
                          disabled={savingParcela === p.contaAPagarId}
                        >
                          Baixar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              {confirmDeleteConta ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-mute)' }}>Excluir toda a conta?</span>
                  <button
                    className="btn-primary red btn-sm"
                    onClick={handleDeleteConta}
                    disabled={savingParcela === -2}
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
              )}
              <div className="modal-actions-right">
                {parcelasPagas < parcelas.length && (
                  <button
                    className="btn-ghost btn-sm"
                    onClick={handleBaixaConta}
                    disabled={savingParcela === -1}
                  >
                    {savingParcela === -1 ? '…' : 'Quitar Todas'}
                  </button>
                )}
                <button
                  className="btn-primary red"
                  onClick={() => navigate('/contas-a-pagar')}
                >
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

export default AddContaAPagar;
