# 🌶️ PepperImports — Monorepo

Sistema de gestão de importações com frontend React e backend ASP.NET Core, totalmente dockerizado.

---

## 📁 Estrutura do Projeto

```
PepperImportsProject/
├── frontend/               # React 19 + TypeScript + Vite
├── backend/                # ASP.NET Core 8 + PostgreSQL
├── docker/
│   ├── dev/
│   │   ├── Dockerfile.backend    # .NET com hot reload
│   │   └── Dockerfile.frontend   # Vite com hot reload
│   └── prod/
│       ├── Dockerfile.backend    # Multi-stage build
│       └── Dockerfile.frontend   # Build estático + Nginx
├── nginx/
│   ├── nginx.conf                # Config global Nginx
│   └── conf.d/default.conf       # Virtual host + proxy reverso
├── postgres/
│   └── init.sql                  # Inicialização do banco
├── scripts/
│   ├── dev.ps1                   # Subir DEV
│   ├── prod.ps1                  # Subir PRODUÇÃO
│   ├── backup-db.ps1             # Backup PostgreSQL
│   ├── restore-db.ps1            # Restore PostgreSQL
│   ├── migrate-db.ps1            # Executar EF Migrations
│   ├── monitor.ps1               # Monitorar containers
│   └── clean-docker.ps1          # Limpeza segura Docker
├── docker-compose.dev.yml        # Compose DEV
├── docker-compose.prod.yml       # Compose PRODUÇÃO
├── .env                          # Variáveis DEV (não commitar)
├── .env.production               # Variáveis PROD (não commitar)
└── .env.example                  # Exemplo (commitar este)
```

---

## 🚀 Início Rápido

### Pré-requisitos
- Docker Desktop 29+
- Docker Compose v5+
- (Opcional) Node 24+ para dev local sem Docker
- (Opcional) .NET SDK 10+ para dev local sem Docker

### 1. Configurar variáveis de ambiente

```powershell
# Copiar o exemplo e preencher os valores
Copy-Item .env.example .env
notepad .env
```

### 2. Criar diretórios de dados no D:

```powershell
New-Item -ItemType Directory -Force D:\docker-data\postgres
New-Item -ItemType Directory -Force D:\docker-data\logs\backend
New-Item -ItemType Directory -Force D:\docker-data\logs\nginx
New-Item -ItemType Directory -Force D:\docker-data\uploads
New-Item -ItemType Directory -Force D:\docker-data\backups
```

### 3. Subir DEV

```powershell
.\scripts\dev.ps1
# Com rebuild forçado:
.\scripts\dev.ps1 -Build
# Ver logs em tempo real:
.\scripts\dev.ps1 -Logs
```

| Serviço    | URL                              |
|-----------|-----------------------------------|
| Frontend  | http://localhost:5173             |
| Backend   | http://localhost:5139             |
| Swagger   | http://localhost:5139/swagger     |
| PostgreSQL| localhost:5432                    |

---

## 🐳 Comandos Docker

### DEV

```powershell
# Subir
docker compose -f docker-compose.dev.yml --env-file .env up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Derrubar
docker compose -f docker-compose.dev.yml down

# Rebuild uma imagem específica
docker compose -f docker-compose.dev.yml build backend
```

### PRODUÇÃO

```powershell
# Subir
.\scripts\prod.ps1

# Com rebuild
.\scripts\prod.ps1 -Build

# Derrubar
.\scripts\prod.ps1 -Down
```

### Monitoramento

```powershell
# Status dos containers
.\scripts\monitor.ps1

# Monitoramento contínuo (atualiza a cada 5s)
.\scripts\monitor.ps1 -Watch

# Ver logs
.\scripts\monitor.ps1 -Logs
```

---

## 🗄️ Banco de Dados

### Backup

```powershell
# Backup DEV
.\scripts\backup-db.ps1

# Backup PROD
.\scripts\backup-db.ps1 -EnvFile .env.production

# Salvar em diretório específico
.\scripts\backup-db.ps1 -OutputDir "D:\meus-backups"
```

### Restore

```powershell
.\scripts\restore-db.ps1 -BackupFile "D:\docker-data\backups\pepper_backup_2026-01-01.sql"
```

### Migrations (Entity Framework)

```powershell
# Local (sem Docker)
.\scripts\migrate-db.ps1

# Via container Docker
.\scripts\migrate-db.ps1 -Docker

# Adicionar nova migration (local)
cd backend\PepperImportsAPI
dotnet ef migrations add NomeDaMigration
dotnet ef database update
```

---

## 🔧 Desenvolvimento Local (sem Docker)

### Frontend

```powershell
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```powershell
cd backend\PepperImportsAPI
dotnet restore
dotnet run
# → http://localhost:5139
```

---

## 🏗️ Build de Produção

```powershell
# Build e subir produção
.\scripts\prod.ps1 -Build

# Build manual das imagens
docker compose -f docker-compose.prod.yml --env-file .env.production build

# Publicar no registry (opcional)
docker tag pepperimports/backend:prod seu-registry/pepperimports/backend:v1.0.0
docker push seu-registry/pepperimports/backend:v1.0.0
```

---

## 🔒 Segurança

- ✅ Containers rodando sem root (`appuser` / `nginx`)
- ✅ PostgreSQL sem exposição pública em produção
- ✅ Redes Docker isoladas (interna vs pública)
- ✅ JWT com chave configurável via env
- ✅ Rate limiting no Nginx (API e login)
- ✅ Security headers configurados no Nginx
- ✅ Secrets nunca no Git (apenas `.env.example`)
- ✅ `no-new-privileges` em produção

### Gerar JWT Secret seguro

```powershell
# PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))

# Ou via Docker
docker run --rm alpine sh -c "cat /dev/urandom | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 64"
```

---

## 📦 Volumes (Disco D:)

| Path                         | Conteúdo               |
|-----------------------------|------------------------|
| `D:\docker-data\postgres`   | Dados do PostgreSQL    |
| `D:\docker-data\uploads`    | Imagens dos produtos   |
| `D:\docker-data\logs\backend` | Logs do backend      |
| `D:\docker-data\logs\nginx` | Logs do Nginx          |
| `D:\docker-data\backups`    | Backups do banco       |

---

## 🔄 Atualização (sem perda de dados)

```powershell
# 1. Fazer backup
.\scripts\backup-db.ps1 -EnvFile .env.production

# 2. Pull do código
git pull

# 3. Rebuild e restart
.\scripts\prod.ps1 -Build

# Rollback (se necessário)
git checkout HEAD~1
.\scripts\prod.ps1 -Build
```

---

## 🌐 HTTPS / Produção VPS

Para habilitar HTTPS em VPS Linux, descomente a seção SSL em:
- [`nginx/conf.d/default.conf`](nginx/conf.d/default.conf)
- [`docker-compose.prod.yml`](docker-compose.prod.yml) (volumes certbot)

```bash
# Obter certificado Let's Encrypt (no VPS)
docker run --rm -v D:/docker-data/certbot/conf:/etc/letsencrypt \
  -v D:/docker-data/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d seudominio.com \
  --email seu@email.com \
  --agree-tos
```

---

## 🛠️ Limpeza Docker

```powershell
# Limpeza segura (preserva dados)
.\scripts\clean-docker.ps1

# Limpeza completa (inclui imagens)
.\scripts\clean-docker.ps1 -Full

# Simulação (dry run)
.\scripts\clean-docker.ps1 -DryRun
```

---

## 📋 Tecnologias

| Camada      | Tecnologia                    |
|------------|-------------------------------|
| Frontend   | React 19, TypeScript, Vite 8  |
| Backend    | ASP.NET Core 8, EF Core       |
| Banco      | PostgreSQL 16                 |
| Auth       | JWT Bearer                    |
| Realtime   | SignalR                       |
| Proxy      | Nginx 1.27                    |
| Container  | Docker 29, Compose v5         |
