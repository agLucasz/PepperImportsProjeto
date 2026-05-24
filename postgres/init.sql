-- ═══════════════════════════════════════════════════════════════════════════
--  PepperImports — Script de inicialização PostgreSQL
--  Executado apenas na primeira criação do banco
-- ═══════════════════════════════════════════════════════════════════════════

-- Configurações de timezone
SET timezone = 'America/Sao_Paulo';

-- O banco PepperImports é criado automaticamente pelo POSTGRES_DB
-- Este script pode ser usado para configurações adicionais

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para buscas por similaridade

-- Log de criação
DO $$
BEGIN
  RAISE NOTICE 'Banco PepperImports inicializado com sucesso em %', NOW();
END $$;
