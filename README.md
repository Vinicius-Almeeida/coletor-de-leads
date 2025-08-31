# 🎯 Coletor de Leads

Sistema para coleta de leads empresariais usando Google Places API e web
scraping ético.

**Status**: Deploy automático habilitado via GitHub Actions

## 🚀 Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Deploy**: Vercel (Frontend) + Node.js Backend

## 📁 Estrutura do Projeto

```
coletor-de-leads/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   ├── App.tsx            # Componente principal
│   └── index.tsx          # Ponto de entrada
├── backend-js/            # Backend Node.js
│   ├── server.js          # Servidor Express
│   ├── package.json       # Dependências Node.js
│   └── services/          # Serviços do backend
├── package.json           # Dependências Frontend
├── tailwind.config.js     # Configuração Tailwind
└── tsconfig.json          # Configuração TypeScript
```

## 🛠️ Instalação e Configuração

### 1. Frontend (React + TypeScript)

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Build para produção
npm run build
```

### 2. Backend (Node.js)

```bash
# Navegar para o diretório backend-js
cd backend-js

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start

# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage
```

### 3. Configuração da API Google Places

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Places API (New)**
4. Crie uma chave de API
5. Configure as restrições da chave (recomendado)

## 🎨 Funcionalidades

### 📱 Interface Responsiva

- Design moderno com Tailwind CSS
- Totalmente responsivo para mobile e desktop
- Navegação intuitiva entre páginas

### 🔍 Busca de Leads

- Formulário de busca por nicho e cidade
- Status em tempo real da busca
- Botão para parar busca em andamento
- Visualização dos resultados em tabela

### 📊 Dashboard

- Estatísticas gerais das buscas
- Visão por segmentos
- Cards informativos com métricas

### 📞 WhatsApp Leads

- Filtro específico para leads com WhatsApp
- Links diretos para WhatsApp
- Download em Excel dos leads com WhatsApp

### 📥 Exportação

- Download em formato Excel (.xlsx)
- Dados organizados e estruturados
- Nomeação automática com timestamp

## 🚀 Deploy Automático

### CI/CD com GitHub Actions

O projeto está configurado com CI/CD automático:

1. **Push para `main`**: Deploy automático para produção
2. **Push para `develop`**: Executa testes
3. **Pull Request**: Executa testes antes do merge

### Configuração dos Secrets

Configure os seguintes secrets no GitHub:

- `GOOGLE_PLACES_API_KEY`: Sua chave da Google Places API
- `VERCEL_TOKEN`: Token do Vercel
- `VERCEL_ORG_ID`: ID da organização no Vercel
- `VERCEL_PROJECT_ID`: ID do projeto backend no Vercel
- `VERCEL_FRONTEND_PROJECT_ID`: ID do projeto frontend no Vercel

### Deploy Manual

#### Frontend (Vercel)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

#### Backend (Vercel)

1. Deploy automático via GitHub Actions
2. Ou deploy manual via Vercel CLI

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GOOGLE_PLACES_API_KEY=sua_chave_da_api_aqui
```

### Proxy para Desenvolvimento

O frontend está configurado para fazer requisições para `http://localhost:3001`
durante o desenvolvimento.

## 📋 Tecnologias Utilizadas

### Frontend

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento da aplicação

### Backend

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Cross-Origin Resource Sharing
- **Puppeteer** - Web scraping
- **ExcelJS** - Geração de arquivos Excel
- **Axios** - Requisições HTTP
- **Cheerio** - Parsing HTML

## 🎯 Próximos Passos

1. **Integração com Google Places API** - Substituir dados simulados
2. **Web Scraping Ético** - Implementar scraping dos sites
3. **Banco de Dados** - Persistência dos dados
4. **Autenticação** - Sistema de login
5. **Relatórios Avançados** - Métricas e análises

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para facilitar a coleta de leads empresariais**
