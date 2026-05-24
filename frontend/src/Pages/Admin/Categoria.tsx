import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Bell, Settings, X } from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import { getAll, create, update, remove, type CategoriaDTO } from '../../Services/categoriaService';
import '../../Styles/Admin/categoria.css';

type Tab = 'lista' | 'cadastro';

type ModalState =
  | null
  | { mode: 'criar' }
  | { mode: 'editar'; categoria: CategoriaDTO };

const PALETTE_SIZE = 6;
const paletteClass = (index: number) => `cat-mark-${index % PALETTE_SIZE}`;
const initials = (nome: string) => nome.substring(0, 2).toUpperCase();

const Categoria: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('lista');
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [formNome, setFormNome] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try { setCategorias(await getAll()); }
    catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => { setFormNome(''); setFormError(''); setModal({ mode: 'criar' }); };
  const abrirEditar = (cat: CategoriaDTO) => { setFormNome(cat.nomeCategoria); setFormError(''); setModal({ mode: 'editar', categoria: cat }); };
  const fecharModal = () => setModal(null);

  const handleSalvar = async () => {
    if (!formNome.trim()) { setFormError('O nome da categoria é obrigatório.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (modal?.mode === 'criar') {
        await create({ nomeCategoria: formNome.trim() });
      } else if (modal?.mode === 'editar') {
        await update(modal.categoria.categoriaId, { nomeCategoria: formNome.trim() });
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
    try { await remove(modal.categoria.categoriaId); await carregar(); fecharModal(); }
    catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'Erro ao excluir.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-shell">
      <SideBar badges={{ categorias: categorias.length }} />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Categorias</b>
            <span className="sep">/</span>
            <span>{tab === 'lista' ? 'Lista' : 'Cadastro'}</span>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">Organização</p>
              <h1 className="page-title">Categorias</h1>
              <p className="page-sub">
                Como o catálogo é organizado para o público. Cada produto pertence a uma categoria.
              </p>
            </div>
            <button className="btn-primary red" onClick={abrirCriar}>
              <Plus size={16} strokeWidth={2.5} />
              Nova Categoria
            </button>
          </div>

          {/* ---- Tabs ---- */}
          <div className="tabs">
            <button className={`tab${tab === 'lista' ? ' active' : ''}`} onClick={() => setTab('lista')}>
              Lista <span className="count">{categorias.length}</span>
            </button>
            <button className={`tab${tab === 'cadastro' ? ' active' : ''}`} onClick={() => setTab('cadastro')}>
              Cadastro
            </button>
          </div>

          {/* ---- Lista ---- */}
          {tab === 'lista' && (
            <div className="cat-grid">
              {loading && (
                <p className="cat-loading">Carregando…</p>
              )}

              {!loading && categorias.map((cat, i) => (
                <div key={cat.categoriaId} className="cat-card">
                  <div className="cat-card-head">
                    <div className={`cat-card-mark ${paletteClass(i)}`}>
                      {initials(cat.nomeCategoria)}
                    </div>
                    <div className="cat-card-actions">
                      <button className="cat-card-btn" title="Editar" onClick={() => abrirEditar(cat)}>
                        <Pencil size={14} strokeWidth={1.8} />
                      </button>
                      <button className="cat-card-btn danger" title="Excluir" onClick={() => abrirEditar(cat)}>
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>

                  <h3>{cat.nomeCategoria}</h3>

                  <div className="cat-card-foot">
                    <div className="count">
                      <small>Produtos</small>
                      0
                    </div>
                  </div>
                </div>
              ))}

              {!loading && (
                <button className="cat-add" onClick={abrirCriar}>
                  <Plus size={20} strokeWidth={1.8} />
                  Adicionar Categoria
                </button>
              )}
            </div>
          )}

          {/* ---- Cadastro ---- */}
          {tab === 'cadastro' && (
            <div className="form-section" style={{ maxWidth: 480 }}>
              <h3>Nova Categoria</h3>
              <p className="hint">Preencha o nome para criar uma nova categoria no catálogo.</p>
              <form onSubmit={e => { e.preventDefault(); handleSalvar(); }}>
                <div className="field">
                  <label>Nome da Categoria <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex: Europeus, Brasileiros…"
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
                    {saving ? 'Salvando…' : 'Criar Categoria'}
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
                <h3>Categoria</h3>
              </div>
              <button className="modal-close" onClick={fecharModal}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label>Nome da Categoria <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ex: Europeus, Brasileiros…"
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

export default Categoria;
