import { apiFetch } from '../Utils/apiFetch';
import { API_BASE } from '../config';

const API = `${API_BASE}/api/categoria`;

export interface CategoriaDTO {
  categoriaId: number;
  nomeCategoria: string;
}

export interface CategoriaCreateDTO {
  nomeCategoria: string;
}

export async function getAll(): Promise<CategoriaDTO[]> {
  const res = await apiFetch(API);
  if (!res.ok) throw new Error('Erro ao buscar categorias.');
  return res.json();
}

export async function create(dto: CategoriaCreateDTO): Promise<void> {
  const res = await apiFetch(API, { method: 'POST', body: JSON.stringify(dto) });
  if (!res.ok) throw new Error('Erro ao criar categoria.');
}

export async function update(id: number, dto: CategoriaCreateDTO): Promise<void> {
  const res = await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
  if (!res.ok) throw new Error('Erro ao atualizar categoria.');
}

export async function remove(id: number): Promise<void> {
  const res = await apiFetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir categoria.');
}
