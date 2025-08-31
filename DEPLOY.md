# 🚀 Guia de Deploy - Coletor de Leads

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Vercel
- Chave da Google Places API

## 🔧 Configuração do GitHub

### 1. Criar repositório no GitHub

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Initial commit: Coletor de Leads com CI/CD"

# Adicionar remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/coletor-de-leads.git

# Push para main
git push -u origin main
```

### 2. Configurar Secrets no GitHub

Vá em **Settings > Secrets and variables > Actions** e adicione:

- `GOOGLE_PLACES_API_KEY`: `AIzaSyDZuvIx3XZxNhkzIWv6OjKmdrw6aDbm_Rk`
- `VERCEL_TOKEN`: Token do Vercel
- `VERCEL_ORG_ID`: ID da organização no Vercel
- `VERCEL_PROJECT_ID`: ID do projeto backend no Vercel
- `VERCEL_FRONTEND_PROJECT_ID`: ID do projeto frontend no Vercel

## 🚀 Configuração do Vercel

### 1. Deploy do Backend

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório
3. Configure:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend-js`
   - **Build Command**: `npm install`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

### 2. Deploy do Frontend

1. Crie outro projeto no Vercel
2. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `.`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3. Variáveis de Ambiente no Vercel

**Backend:**

- `GOOGLE_PLACES_API_KEY`: `AIzaSyDZuvIx3XZxNhkzIWv6OjKmdrw6aDbm_Rk`
- `PORT`: `3001`

**Frontend:**

- `REACT_APP_API_URL`: URL do backend no Vercel

## 🧪 Testes

### Executar testes localmente

```bash
# Backend
cd backend-js
npm test

# Frontend
npm test
```

### Testes automáticos

Os testes rodam automaticamente no GitHub Actions a cada:

- Push para `main` ou `develop`
- Pull Request

## 📊 Monitoramento

- **GitHub Actions**: Status dos testes e deploy
- **Vercel**: Logs de deploy e performance
- **Google Cloud Console**: Uso da API Places

## 🔄 Workflow de Desenvolvimento

1. **Desenvolvimento**: Branch `develop`
2. **Testes**: Automáticos no PR
3. **Deploy**: Automático no merge para `main`
4. **Produção**: Disponível em URLs do Vercel

## 🆘 Troubleshooting

### Erro de API Key

- Verificar se a chave está configurada nos secrets
- Verificar se a API Places está ativa no Google Cloud

### Erro de Deploy

- Verificar logs no Vercel
- Verificar se todas as dependências estão no package.json

### Erro de Testes

- Verificar se o servidor está rodando localmente
- Verificar se as variáveis de ambiente estão configuradas
