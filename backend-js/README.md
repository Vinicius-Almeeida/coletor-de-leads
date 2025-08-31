# 🚀 Backend Node.js - Coletor de Leads

Backend completo em JavaScript para o sistema de coleta de leads empresariais.

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Puppeteer** - Scraping de websites
- **Cheerio** - Parsing HTML
- **ExcelJS** - Geração de arquivos Excel
- **Axios** - Requisições HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📦 Instalação

1. **Instalar dependências:**

```bash
npm install
```

2. **Configurar variáveis de ambiente:**

```bash
cp env.example .env
# Editar .env com sua API key do Google Places
```

3. **Executar o servidor:**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração da API do Google Places
GOOGLE_PLACES_API_KEY=sua_chave_aqui

# Configuração do servidor
PORT=5000

# Configurações de scraping
SCRAPING_TIMEOUT=10000
PUPPETEER_HEADLESS=true
```

### Google Places API

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Habilite a **Places API (New)**
4. Crie uma API key
5. Configure as restrições da API key

## 📡 Endpoints da API

### Health Check

- **GET** `/api/health` - Verificação de saúde da API

### Teste

- **GET** `/api/test` - Endpoint de teste com informações da requisição

### Busca

- **POST** `/api/search` - Inicia uma nova busca
- **GET** `/api/status` - Retorna o status atual da busca
- **POST** `/api/stop` - Para a busca atual

### Download

- **GET** `/api/download` - Download dos resultados em Excel
- **GET** `/api/download-whatsapp-leads` - Download dos leads com WhatsApp

### Dashboard

- **GET** `/api/dashboard-data` - Dados para o dashboard
- **GET** `/api/whatsapp-leads` - Leads que possuem WhatsApp

## 🔍 Funcionalidades

### 1. Busca via Google Places API

- Busca empresas por nicho e cidade
- Múltiplas variações de busca
- Remoção de duplicatas
- Dados básicos: nome, telefone, site, endereço

### 2. Scraping Ético

- Extração de emails dos sites
- Busca por perfis LinkedIn
- Busca por perfis Facebook
- Extração de números WhatsApp
- Fallback: Axios → Puppeteer

### 3. Geração de Excel

- Arquivos Excel formatados
- Cabeçalhos em português
- Bordas e formatação
- Suporte a leads com WhatsApp

### 4. Status em Tempo Real

- Progresso da busca
- Fase atual
- Empresa sendo processada
- Contadores de resultados

## 🚀 Deploy

### Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Railway

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático

### Heroku

1. Crie um app no Heroku
2. Conecte o repositório
3. Configure as variáveis de ambiente
4. Deploy

## 📊 Estrutura do Projeto

```
backend-js/
├── server.js              # Servidor principal
├── package.json           # Dependências
├── env.example           # Exemplo de variáveis
├── services/
│   ├── googlePlaces.js   # Integração Google Places
│   ├── scraper.js        # Scraping de websites
│   └── excelGenerator.js # Geração de Excel
└── README.md             # Documentação
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
npm start     # Executa em produção
npm run dev   # Executa com nodemon (desenvolvimento)
npm test      # Executa testes (a implementar)
```

### Logs

O servidor exibe logs detalhados:

- 🔍 Buscas sendo realizadas
- 📊 Progresso do scraping
- ✅ Sucessos
- ❌ Erros
- ⚠️ Avisos

## 🎯 Próximos Passos

1. **Testes automatizados**
2. **Cache de resultados**
3. **Rate limiting**
4. **Autenticação**
5. **Banco de dados**
6. **Métricas avançadas**

---

**Desenvolvido com ❤️ pela 3IAN**
