import { apiFetch } from '../Utils/apiFetch';
import { API_BASE } from '../config';

const API = `${API_BASE}/api/despesa`;

export interface DespesaDTO {
  despesaId: number;
  nomeDespesa: string;
}

export const getAll = async (): Promise<DespesaDTO[]> => {
  const r = await apiFetch(API);
  return r.json();
};

export const getById = async (id: number): Promise<DespesaDTO> => {
  const r = await apiFetch(`${API}/${id}`);
  return r.json();
};

export const create = async (dto: { nomeDespesa: string }): Promise<void> => {
  const r = await apiFetch(API, { method: 'POST', body: JSON.stringify(dto) });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || 'Erro ao criar despesa.');
  }
};

export const update = async (id: number, dto: { nomeDespesa: string }): Promise<void> => {
  const r = await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || 'Erro ao atualizar despesa.');
  }
};

export const remove = async (id: number): Promise<void> => {
  await apiFetch(`${API}/${id}`, { method: 'DELETE' });
};
