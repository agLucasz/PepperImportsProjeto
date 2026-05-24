import { API_BASE as _BASE } from '../config';
const API_BASE = `${_BASE}/api`;

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuarioId: number;
  token: string;
  nome: string;
  email: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
  }

  return res.json();
}

export function saveSession(data: LoginResponse): void {
  localStorage.setItem('pepper_token', data.token);
  localStorage.setItem('pepper_user', JSON.stringify({ id: data.usuarioId, nome: data.nome, email: data.email }));
}

export function clearSession(): void {
  localStorage.removeItem('pepper_token');
  localStorage.removeItem('pepper_user');
}

export function getToken(): string | null {
  return localStorage.getItem('pepper_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
