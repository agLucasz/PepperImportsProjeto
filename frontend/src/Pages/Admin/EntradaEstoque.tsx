import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, X, PackagePlus } from 'lucide-react';
import SideBar from '../../Components/Admin/SideBar';
import {
  getAll,
  create,
  remove,
  type EntradaEstoqueDTO,
} from '../../Services/entradaEstoqueService';
import { getAll as getProdutos, TAMANHOS, type ProdutoDTO } from '../../Services/produtoService';
import '../../Styles/Admin/entradaEstoque.css';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const today = () => new Date().toISOString().split('T')[0];

const EntradaEstoque: React.FC = () => {
  const navigate = useNavigate();

  const [entradas, setEntradas] = useState<EntradaEstoqueDTO[]>([]);
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ produtoId: '', tamanho: '', quantidade: '', data: today() });
  const [formError, setFormError] = useState('');

  /** Tamanhos disponíveis no produto selecionado (com estoque configurado) */
  const tamanhosDoProduto = form.produtoId
    ? (produtos.find(p => p.produtoId === parseInt(form.produtoId))?.estoques ?? [])
    : [];

  const carregar = async () => {
    setLoading(true);
    try {
      const [e, p] = await Promise.all([getAll(), getProdutos()]);
      setEntradas(e);
      setProdutos(p);
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const filtered = entradas.filter(e =>
    e.produto.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setForm({ produtoId: '', tamanho: '', quantidade: '', data: today() });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.produtoId)  { setFormError('Selecione um produto.'); return; }
    if (!form.tamanho)    { setFormError('Selecione um tamanho.'); return; }
    const qty = parseInt(form.quantidade);
    if (!qty || qty < 1)  { setFormError('Informe uma quantidade válida.'); return; }
    if (!form.data)       { setFormError('Informe a data da entrada.'); return; }

    setSaving(true);
    setFormError('');
    try {
      await create({
        produtoId: parseInt(form.produtoId),
        tamanho: parseInt(form.tamanho),
        quantidadeEntrada: qty,
        dataEntrada: new Date(form.data).toISOString(),
      });
      setShowModal(false);
      await carregar();
    } catch {
      setFormError('Erro ao registrar entrada. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try { await remove(id); await carregar(); }
    catch { /* silently ignore */ }
    finally { setConfirmDelete(null); }
  };

  return (
    <div className="admin-shell">
      <SideBar badges={{ estoque: entradas.length }} />

      <main className="main">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="topbar-crumb">
            <span>Pepper Admin</span>
            <span className="sep">/</span>
            <b>Entrada de Estoque</b>
          </div>
        </div>

        {/* ---- Page ---- */}
        <div className="page">
          <div className="page-head">
            <div>
              <p className="page-eyebrow">Estoque</p>
              <h1 className="page-title">Entrada de Estoque</h1>
              <p className="page-sub">
                Registre e acompanhe todas as entradas de produtos no estoque.
              </p>
            </div>
            <button className="btn-primary red" onClick={openModal}>
              <Plus size={16} strokeWidth={2.5} />
              Nova Entrada
            </button>
          </div>

          {/* ---- Summary cards ---- */}
          <div className="estoque-summary">
            <div className="estoque-stat-card">
              <div className="estoque-stat-icon">
                <PackagePlus size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="estoque-stat-label">Total de entradas</p>
                <p className="estoque-stat-value">{entradas.length}</p>
              </div>
            </div>
            <div className="estoque-stat-card">
              <div className="estoque-stat-icon">
                <PackagePlus size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="estoque-stat-label">Unidades recebidas</p>
                <p className="estoque-stat-value">
                  {entradas.reduce((acc, e) => acc + e.quantidadeEntrada, 0)}
                </p>
              </div>
            </div>
            <div className="estoque-stat-card">
              <div className="estoque-stat-icon">
                <PackagePlus size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="estoque-stat-label">Produtos distintos</p>
                <p className="estoque-stat-value">
                  {new Set(entradas.map(e => e.produtoId)).size}
                </p>
              </div>
            </div>
          </div>

          {/* ---- Table ---- */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-search">
                <Search size={14} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  placeholder="Filtrar por produto…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="table-filters">
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  color: 'var(--fg-mute)',
                }}>
                  {filtered.length} entrada{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Tamanho</th>
                  <th>Qtd. Recebida</th>
                  <th>Data de Entrada</th>
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
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--fg-soft)', fontSize: 12 }}>
                      Nenhuma entrada encontrada
                    </td>
                  </tr>
                )}
                {!loading && filtered.map(entrada => {
                  const tamLabel = TAMANHOS.find(t => t.value === entrada.tamanho)?.label ?? String(entrada.tamanho);
                  return (
                  <tr key={entrada.estoqueId} className="row">
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--fg-mute)' }}>
                      #{entrada.estoqueId}
                    </td>
                    <td>
                      <div className="estoque-produto-cell">
                        <div className="estoque-produto-dot" />
                        <span>{entrada.produto}</span>
                      </div>
                    </td>
                    <td>
                      <span className="size-pill">{tamLabel}</span>
                    </td>
                    <td>
                      <span className="estoque-qty-badge">+{entrada.quantidadeEntrada}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                      {fmtDate(entrada.dataEntrada)}
                    </td>
                    <td className="actions">
                      {confirmDelete === entrada.estoqueId ? (
                        <div className="row-delete-confirm">
                          <button
                            className="btn-primary red btn-sm"
                            style={{ fontSize: 11, padding: '6px 12px' }}
                            onClick={() => handleDelete(entrada.estoqueId)}
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
                            className="btn-icon danger"
                            title="Excluir"
                            onClick={() => setConfirmDelete(entrada.estoqueId)}
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
              <span>{filtered.length} de {entradas.length} entrada{entradas.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </main>

      {/* ---- Modal Nova Entrada ---- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="modal-eyebrow">Estoque</p>
                <h3>Nova Entrada</h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            {formError && <p className="modal-error">{formError}</p>}

            <div className="field">
              <label>Produto <span className="req">*</span></label>
              <select
                value={form.produtoId}
                onChange={e => setForm(f => ({ ...f, produtoId: e.target.value, tamanho: '' }))}
              >
                <option value="">Selecione um produto…</option>
                {produtos.filter(p => p.ativo).map(p => (
                  <option key={p.produtoId} value={p.produtoId}>
                    {p.nomeProduto}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tamanho <span className="req">*</span></label>
              <select
                value={form.tamanho}
                onChange={e => setForm(f => ({ ...f, tamanho: e.target.value }))}
                disabled={!form.produtoId}
              >
                <option value="">{form.produtoId ? 'Selecione um tamanho…' : 'Selecione um produto primeiro'}</option>
                {tamanhosDoProduto.map(e => {
                  const label = TAMANHOS.find(t => t.value === e.tamanho)?.label ?? String(e.tamanho);
                  return (
                    <option key={e.tamanho} value={e.tamanho}>
                      {label} — estoque atual: {e.quantidade}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Quantidade a Adicionar <span className="req">*</span></label>
                <input
                  type="number"
                  min={1}
                  placeholder="Ex: 50"
                  value={form.quantidade}
                  onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Data de Entrada <span className="req">*</span></label>
                <input
                  type="date"
                  value={form.data}
                  onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <div className="modal-actions-right">
                <button
                  className="btn-primary red"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Registrando…' : 'Registrar Entrada'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntradaEstoque;
