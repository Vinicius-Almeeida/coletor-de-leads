# MVP API - Documentação do Endpoint de Scraping

## Visão Geral

Este MVP implementa um endpoint simplificado para scraping de leads sem persistência em banco de dados. O objetivo é fornecer uma API focada em receita que executa o scraping e retorna os dados diretamente.

## Endpoint Principal

### POST /api/v1/leads/scrape

Executa scraping de leads baseado em termo de busca e cidade.

#### Autenticação

- **Tipo**: Header X-API-Key
- **Variável de ambiente**: `INTERNAL_API_KEY`
- **Exemplo**: `X-API-Key: sua_chave_api_interna_aqui`

#### Parâmetros de Entrada

```json
{
  "termo_busca": "string (obrigatório)",
  "cidade": "string (obrigatório)"
}
```

#### Exemplo de Requisição

```bash
curl -X POST http://localhost:3001/api/v1/leads/scrape \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_chave_api_interna_aqui" \
  -d '{
    "termo_busca": "restaurante",
    "cidade": "São Paulo"
  }'
```

#### Respostas

##### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Scraping concluído com sucesso",
  "leads": [
    {
      "nome": "Nome da Empresa",
      "telefone": "+55 11 99999-9999",
      "site": "https://empresa.com",
      "endereco": "Endereço completo",
      "email": "contato@empresa.com",
      "linkedin": "https://linkedin.com/company/empresa",
      "facebook": "https://facebook.com/empresa",
      "instagram": "https://instagram.com/empresa",
      "whatsapp": "11999999999",
      "termo_busca": "restaurante",
      "cidade": "São Paulo",
      "processado_em": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total_leads": 1,
  "search_params": {
    "termo_busca": "restaurante",
    "cidade": "São Paulo"
  },
  "processing_info": {
    "empresas_encontradas": 5,
    "empresas_processadas": 1,
    "limite_mvp": 20
  }
}
```

##### Erro de Autenticação (401 Unauthorized)

```json
{
  "error": "X-API-Key header é obrigatório",
  "message": "Forneça a chave de API no header X-API-Key"
}
```

```json
{
  "error": "Chave de API inválida",
  "message": "A chave fornecida não é válida"
}
```

##### Erro de Validação (400 Bad Request)

```json
{
  "error": "Parâmetros obrigatórios ausentes",
  "message": "Os campos \"termo_busca\" e \"cidade\" são obrigatórios",
  "required_fields": ["termo_busca", "cidade"]
}
```

##### Erro de Configuração (500 Internal Server Error)

```json
{
  "error": "Configuração de API ausente",
  "message": "Chave da API do Google Places não configurada"
}
```

## Configuração

### Variáveis de Ambiente Necessárias

```env
# Chave de API interna para autenticação do MVP
INTERNAL_API_KEY=sua_chave_api_interna_aqui

# Chave da API do Google Places
GOOGLE_PLACES_API_KEY=sua_chave_google_places_aqui

# Porta do servidor (opcional)
PORT=3001
```

### Instalação e Execução

1. **Instalar dependências**:
   ```bash
   cd backend-js
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp env.example .env
   # Editar .env com suas chaves
   ```

3. **Executar servidor**:
   ```bash
   node server.js
   ```

4. **Executar testes**:
   ```bash
   npm test
   ```

## Limitações do MVP

- **Máximo de 20 empresas processadas** por requisição
- **Sem persistência em banco de dados** - dados são retornados diretamente
- **Sem cache** - cada requisição executa scraping completo
- **Autenticação simples** via X-API-Key

## Fluxo de Processamento

1. **Validação de autenticação** via X-API-Key
2. **Validação de parâmetros** obrigatórios
3. **Busca de empresas** via Google Places API
4. **Enriquecimento de dados** via scraping com Puppeteer
5. **Retorno dos dados** enriquecidos

## Estrutura de Arquivos

```
backend-js/
├── middleware/
│   └── apiKeyAuth.js          # Middleware de autenticação
├── routes/
│   └── leadRoutes.js          # Rotas do MVP
├── services/
│   ├── googlePlaces.js        # Integração Google Places
│   └── scraper.js             # Serviço de scraping
├── tests/
│   └── leadRoutes.test.js     # Testes do endpoint
└── server.js                  # Servidor principal
```

## Testes

Execute os testes com:
```bash
npm test
```

Os testes cobrem:
- Autenticação via X-API-Key
- Validação de parâmetros
- Tratamento de erros
- Configuração de APIs

## Branch de Desenvolvimento

Este MVP foi desenvolvido na branch `mvp-receita` para isolamento do projeto principal.
