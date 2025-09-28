# Documentação da API - Coletor de Leads v1.0

## URL Base

A URL base para todas as chamadas de API em produção é:
`https://coletor-de-leads.vercel.app`

## Autenticação

A API utiliza autenticação via JWT (JSON Web Token).

1.  **Passo 1: Obter o Token:** Envie uma requisição `POST` para o endpoint
    `/api/users/login` com o email e a senha.
2.  **Passo 2: Enviar o Token:** Em todas as requisições subsequentes para
    endpoints protegidos, inclua o header de autorização:
    `Authorization: Bearer <seu_token_jwt>`

## Endpoints Principais

### Autenticação

- **`POST /api/users/login`**
  - **Descrição:** Autentica um usuário e retorna um token JWT.
  - **Body (JSON):**
    `{ "email": "user@example.com", "password": "your_password" }`
  - **Resposta de Sucesso (200 OK):** `{ "token": "ey..." }`

### Leads

- **`GET /api/leads`**

  - **Descrição:** Retorna uma lista de todos os leads coletados pelo usuário
    autenticado.
  - **Headers:** `Authorization: Bearer <seu_token_jwt>`
  - **Resposta de Sucesso (200 OK):**
    `[{ "id": 1, "nome": "Empresa A", "whatsapp": "5547999998888", ... }, ...]`

- **`GET /api/whatsapp-leads`**
  - **Descrição:** Retorna uma lista filtrada, contendo apenas os leads que
    possuem um número de WhatsApp identificado.
  - **Headers:** `Authorization: Bearer <seu_token_jwt>`
  - **Resposta de Sucesso (200 OK):**
    `[{ "id": 2, "nome": "Empresa B", "whatsapp": "5547988887777", ... }, ...]`

### Dashboard

- **`GET /api/dashboard-data`**
  - **Descrição:** Retorna os dados e estatísticas para o painel principal.
  - **Headers:** `Authorization: Bearer <seu_token_jwt>`
  - **Resposta de Sucesso (200 OK):**
    `{ "total_leads": 150, "segments": { "restaurante": 50, "advogado": 100 } }`
