import { apiFetch } from '../Utils/apiFetch';
import { API_BASE } from '../config';

const API = `${API_BASE}/api/contaapagar`;

export interface ContaAPagarDTO {
  contaAPagarId: number;
  contaId: number;
  despesaId: number;
  nomeDespesa: string;
  numeroParcela: number;
  totalParcelas: number;
  valorParcela: number;
  valorTotal: number;
  dataVencimento: string;
  dataAbertura: string;
  dataPagamento?: string;
  pago: boolean;
}

export interface ContaAPagarCreateDTO {
  despesaId: number;
  totalParcelas: number;
  valorParcela: number;
  dataPrimeiroVencimento: string;
}

export interface ContaAPagarUpdateDTO {
  valorParcela?: number;
  dataVencimento?: string;
}

export const getAll = async (): Promise<ContaAPagarDTO[]> => {
  const r = await apiFetch(API);
  return r.json();
};

export const getById = async (id: number): Promise<ContaAPagarDTO> => {
  const r = await apiFetch(`${API}/${id}`);
  return r.json();
};

export const getByContaId = async (contaId: number): Promise<ContaAPagarDTO[]> => {
  const r = await apiFetch(`${API}/conta/${contaId}`);
  return r.json();
};

export const create = async (dto: ContaAPagarCreateDTO): Promise<void> => {
  const r = await apiFetch(API, { method: 'POST', body: JSON.stringify(dto) });
  if (!r.ok) throw new Error('Erro ao lançar conta.');
};

export const update = async (id: number, dto: ContaAPagarUpdateDTO): Promise<void> => {
  await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
};

export const remove = async (id: number): Promise<void> => {
  await apiFetch(`${API}/${id}`, { method: 'DELETE' });
};

export const deleteConta = async (contaId: number): Promise<void> => {
  await apiFetch(`${API}/conta/${contaId}`, { method: 'DELETE' });
};

export const baixaParcela = async (id: number): Promise<void> => {
  await apiFetch(`${API}/${id}/baixa`, { method: 'PATCH' });
};

export const baixaConta = async (contaId: number): Promise<void> => {
  await apiFetch(`${API}/conta/${contaId}/baixa`, { method: 'PATCH' });
};
