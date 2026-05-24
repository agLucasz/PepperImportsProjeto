import { apiFetch } from '../Utils/apiFetch';
import { API_BASE } from '../config';

const API = `${API_BASE}/api/venda`;

export interface VendaItemDTO {
  vendaItemId: number;
  produtoId: number;
  nomeProduto: string;
  tamanho: number;
  quantidadeItem: number;
  valorItem?: number;
}

export interface VendaDTO {
  vendaId: number;
  itens: VendaItemDTO[];
  valorVenda: number;
  dataVenda?: string;
}

export interface VendaItemCreateDTO {
  produtoId: number;
  tamanho: number;
  quantidadeItem: number;
  valorItem?: number;
}

export interface VendaCreateDTO {
  itens: VendaItemCreateDTO[];
}

export const getAll = async (): Promise<VendaDTO[]> => {
  const r = await apiFetch(API);
  return r.json();
};

export const getById = async (id: number): Promise<VendaDTO> => {
  const r = await apiFetch(`${API}/${id}`);
  return r.json();
};

export const create = async (dto: VendaCreateDTO): Promise<void> => {
  await apiFetch(API, { method: 'POST', body: JSON.stringify(dto) });
};

export const addItem = async (id: number, dto: VendaItemCreateDTO): Promise<void> => {
  await apiFetch(`${API}/${id}/itens`, { method: 'POST', body: JSON.stringify(dto) });
};

export const reopen = async (id: number): Promise<void> => {
  await apiFetch(`${API}/${id}/reabrir`, { method: 'PATCH' });
};

export const cancel = async (id: number): Promise<void> => {
  await apiFetch(`${API}/${id}`, { method: 'DELETE' });
};
