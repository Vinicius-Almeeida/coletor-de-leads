# 🎯 Coletor de Leads

Sistema híbrido para coleta de leads empresariais usando Google Places API e web
scraping ético.

## 🚀 Nova Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python Flask
- **Deploy**: Vercel (Frontend) + Python Backend

## 📁 Estrutura do Projeto

```
coletor-de-leads/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   ├── App.tsx            # Componente principal
│   └── index.tsx          # Ponto de entrada
├── backend/               # Backend Python
│   ├── app.py             # Servidor Flask
│   └── requirements.txt   # Dependências Python
├── package.json           # Dependências Node.js
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

### 2. Backend (Python Flask)

```bash
# Navegar para o diretório backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python app.py
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

## 🚀 Deploy

### Frontend (Vercel)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Backend (Python)

- Pode ser deployado em qualquer servidor Python
- Heroku, Railway, DigitalOcean, etc.

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GOOGLE_PLACES_API_KEY=sua_chave_da_api_aqui
```

### Proxy para Desenvolvimento

O frontend está configurado para fazer requisições para `http://localhost:5000`
durante o desenvolvimento.

## 📋 Tecnologias Utilizadas

### Frontend

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento da aplicação

### Backend

- **Flask** - Framework web Python
- **Flask-CORS** - Cross-Origin Resource Sharing
- **Pandas** - Manipulação de dados
- **OpenPyXL** - Geração de arquivos Excel
- **Requests** - Requisições HTTP
- **BeautifulSoup** - Web scraping

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
