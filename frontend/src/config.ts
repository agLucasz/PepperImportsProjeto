/**
 * Configuração central de URLs da API.
 *
 * Estratégias:
 * - DEV local (sem Docker):  VITE_API_URL=http://localhost:5139  →  http://localhost:5139/api/...
 * - DEV Docker:              VITE_API_URL=http://localhost:5139  →  http://localhost:5139/api/...
 * - PROD Docker (nginx):     VITE_API_URL vazio → URL relativa   →  /api/... (nginx proxia)
 * - PROD VPS com domínio:    VITE_API_URL=https://seudominio.com →  https://seudominio.com/api/...
 *
 * Em produção com nginx, deixar VITE_API_URL vazio é o ideal:
 * o nginx serve o frontend e proxia /api/* para o backend.
 */
const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;

/**
 * Base URL da API — sem barra final.
 * Vazio = URL relativa (proxy nginx em produção).
 */
export const API_BASE: string = envApiUrl ?? 'http://localhost:5139';
