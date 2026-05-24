/**
 * Wrapper central de fetch.
 * – Injeta o Bearer token automaticamente.
 * – Em caso de 401 limpa a sessão e redireciona para /login.
 */
import { clearSession } from '../Services/authService';

const token = () => localStorage.getItem('pepper_token') ?? '';

export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.replace('/login');
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return res;
}

/** Variante sem Content-Type (para FormData/multipart) */
export async function apiFetchForm(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.replace('/login');
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return res;
}
