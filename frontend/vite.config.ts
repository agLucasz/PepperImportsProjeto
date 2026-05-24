import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',  // necessário para Docker hot reload
      port: 5173,
    },
    // Garante que VITE_API_URL seja exposta para import.meta.env
    envPrefix: 'VITE_',
  }
})
