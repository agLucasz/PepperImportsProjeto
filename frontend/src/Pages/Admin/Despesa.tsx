import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Bell, Settings, X } from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import {
  getAll, create, update, remove, type DespesaDTO,
} from '../../Services/despesaService';
import '../../Styles/Admin/despesa.css';

type Tab = 'lista' | 'cadastro';

type ModalState =
  | null
  | { mode: 'criar' }
  | { mode: 'editar'; despesa: DespesaDTO };

const PALETTE_SIZE = 6;
const paletteClass = (i: number) => `cat-mark-${i % PALETTE_SIZE}`;
const initials = (nome: string) => nome.substring(0, 2).toUpperCase();

const Despesa: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('lista');
  const [despesas, setDespesas] = useState<DespesaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [formNome, setFormNome] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try { setDespesas(await getAll()); }
    catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => { setFormNome(''); setFormError(''); setModal({ mode: 'criar' }); };
  const abrirEditar = (d: DespesaDTO) => { setFormNome(d.nomeDespesa); setFormError(''); setModal({ mode: 'editar', despesa: d }); };
  const fecharModal = () => setModal(null);

  const handleSalvar = async () => {
    if (!formNome.trim()) { setFormError('O nome da despesa é obrigatório.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (modal?.mode === 'criar') {
        await create({ nomeDespesa: formNome.trim() });
      } else if (modal?.mode === 'editar') {
        await update(modal.despesa.despesaId, { nomeDespesa: formNome.trim() });
      }
      await carregar();
      fecharModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async () => {
    if (modal?.mode !== 'editar') return;
    setSaving(true);
    try { await remove(modal.despesa.despesaId); await carregar(); fecharModal(); }
    catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'Erro ao excluir.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-shell">
      <SideBar badges={{ despesas: despesas.length }} />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Despesas</b>
            <span className="sep">/</span>
            <span>{tab === 'lista' ? 'Lista' : 'Cadastro'}</span>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">Financeiro</p>
              <h1 className="page-title">Despesas</h1>
              <p className="page-sub">
                Categorias de despesas para organizar as contas a pagar.
              </p>
            </div>
            <button className="btn-primary red" onClick={abrirCriar}>
              <Plus size={16} strokeWidth={2.5} />
              Nova Despesa
            </button>
          </div>

          {/* ---- Tabs ---- */}
          <div className="tabs">
            <button className={`tab${tab === 'lista' ? ' active' : ''}`} onClick={() => setTab('lista')}>
              Lista <span className="count">{despesas.length}</span>
            </button>
            <button className={`tab${tab === 'cadastro' ? ' active' : ''}`} onClick={() => setTab('cadastro')}>
              Cadastro
            </button>
          </div>

          {/* ---- Lista ---- */}
          {tab === 'lista' && (
            <div className="cat-grid">
              {loading && <p className="cat-loading">Carregando…</p>}

              {!loading && despesas.map((d, i) => (
                <div key={d.despesaId} className="cat-card">
                  <div className="cat-card-head">
                    <div className={`cat-card-mark ${paletteClass(i)}`}>
                      {initials(d.nomeDespesa)}
                    </div>
                    <div className="cat-card-actions">
                      <button className="cat-card-btn" title="Editar" onClick={() => abrirEditar(d)}>
                        <Pencil size={14} strokeWidth={1.8} />
                      </button>
                      <button className="cat-card-btn danger" title="Excluir" onClick={() => abrirEditar(d)}>
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>

                  <h3>{d.nomeDespesa}</h3>

                  <div className="cat-card-foot">
                    <div className="count">
                      <small>Despesa ID</small>
                      #{d.despesaId}
                    </div>
                  </div>
                </div>
              ))}

              {!loading && (
                <button className="cat-add" onClick={abrirCriar}>
                  <Plus size={20} strokeWidth={1.8} />
                  Adicionar Despesa
                </button>
              )}
            </div>
          )}

          {/* ---- Cadastro ---- */}
          {tab === 'cadastro' && (
            <div className="form-section" style={{ maxWidth: 480 }}>
              <h3>Nova Despesa</h3>
              <p className="hint">Preencha o nome para criar uma nova categoria de despesa.</p>
              <form onSubmit={e => { e.preventDefault(); handleSalvar(); }}>
                <div className="field">
                  <label>Nome da Despesa <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex: Aluguel, Importação, Frete…"
                    value={formNome}
                    onChange={e => setFormNome(e.target.value)}
                    required
                  />
                </div>
                {formError && <p className="modal-error" style={{ marginBottom: 16 }}>{formError}</p>}
                <div className="form-actions">
                  <button type="button" className="btn-ghost btn-sm" onClick={() => { setFormNome(''); setFormError(''); }}>
                    Limpar
                  </button>
                  <button type="submit" className="btn-primary red btn-sm" disabled={saving}>
                    {saving ? 'Salvando…' : 'Criar Despesa'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ---- Modal ---- */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) fecharModal(); }}>
          <div className="modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">{modal.mode === 'criar' ? 'Nova' : 'Editar'}</p>
                <h3>Despesa</h3>
              </div>
              <button className="modal-close" onClick={fecharModal}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label>Nome da Despesa <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ex: Aluguel, Importação, Frete…"
                value={formNome}
                onChange={e => setFormNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSalvar()}
                autoFocus
              />
            </div>

            {formError && <p className="modal-error">{formError}</p>}

            <div className="modal-actions">
              {modal.mode === 'editar' && (
                <button className="btn-ghost btn-sm btn-danger" onClick={handleExcluir} disabled={saving}>
                  Excluir
                </button>
              )}
              <div className="modal-actions-right">
                <button className="btn-ghost btn-sm" onClick={fecharModal} disabled={saving}>
                  Cancelar
                </button>
                <button className="btn-primary red btn-sm" onClick={handleSalvar} disabled={saving}>
                  {saving ? 'Salvando…' : modal.mode === 'criar' ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Despesa;
