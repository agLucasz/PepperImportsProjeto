import { apiFetch, apiFetchForm } from '../Utils/apiFetch';
import { API_BASE as _BASE } from '../config';

const API_BASE = `${_BASE}/api`;
export const IMG_BASE = _BASE;

export const imageUrl = (path: string) =>
  path.startsWith('http') ? path : `${IMG_BASE}${path}`;

export const TAMANHOS = [
  { value: 1, label: 'PP' },
  { value: 2, label: 'M'  },
  { value: 3, label: 'G'  },
  { value: 4, label: 'GG' },
  { value: 5, label: 'G1' },
  { value: 6, label: 'G2' },
] as const;

export interface ProdutoEstoqueItem {
  tamanho: number;
  quantidade: number;
}

export interface ProdutoDTO {
  produtoId: number;
  nomeProduto: string;
  descricao?: string;
  imagemUrls: string[];
  estoques: ProdutoEstoqueItem[];
  quantidadeTotal: number;
  valorCompra: number;
  valorVenda: number;
  categoriaIds: number[];
  categorias: string[];
  ativo: boolean;
  destaque: boolean;
}

export interface ProdutoCreateDTO {
  nomeProduto: string;
  descricao?: string;
  imagemUrls: string[];
  estoques: ProdutoEstoqueItem[];
  valorCompra: number;
  valorVenda: number;
  categoriaIds: number[];
  ativo: boolean;
  destaque: boolean;
}

export async function getAll(): Promise<ProdutoDTO[]> {
  const res = await apiFetch(`${API_BASE}/produto`);
  if (!res.ok) throw new Error('Erro ao buscar produtos.');
  return res.json();
}

export async function getById(id: number): Promise<ProdutoDTO> {
  const res = await apiFetch(`${API_BASE}/produto/${id}`);
  if (!res.ok) throw new Error('Produto não encontrado.');
  return res.json();
}

export async function create(dto: ProdutoCreateDTO): Promise<void> {
  const res = await apiFetch(`${API_BASE}/produto`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Erro ao criar produto.');
}

export async function update(id: number, dto: ProdutoCreateDTO): Promise<void> {
  const res = await apiFetch(`${API_BASE}/produto/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Erro ao atualizar produto.');
}

export async function remove(id: number): Promise<void> {
  const res = await apiFetch(`${API_BASE}/produto/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir produto.');
}

export async function uploadImagem(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetchForm(`${API_BASE}/imagem`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Erro ao enviar imagem.');
  const data = await res.json() as { imagemUrl: string };
  return data.imagemUrl;
}
