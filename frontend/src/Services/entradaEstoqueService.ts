import { apiFetch } from '../Utils/apiFetch';
import { API_BASE } from '../config';

const API = `${API_BASE}/api/entrada-estoque`;

export interface EntradaEstoqueDTO {
  estoqueId: number;
  produtoId: number;
  produto: string;
  tamanho: number;
  quantidadeEntrada: number;
  dataEntrada: string;
}

export interface EntradaEstoqueCreateDTO {
  produtoId: number;
  tamanho: number;
  quantidadeEntrada: number;
  dataEntrada: string;
}

export const getAll = async (): Promise<EntradaEstoqueDTO[]> => {
  const r = await apiFetch(API);
  return r.json();
};

export const getById = async (id: number): Promise<EntradaEstoqueDTO> => {
  const r = await apiFetch(`${API}/${id}`);
  return r.json();
};

export const create = async (dto: EntradaEstoqueCreateDTO): Promise<void> => {
  await apiFetch(API, { method: 'POST', body: JSON.stringify(dto) });
};

export const remove = async (id: number): Promise<void> => {
  await apiFetch(`${API}/${id}`, { method: 'DELETE' });
};
