# 🔧 Configuração das Variáveis de Ambiente do Frontend

## 📋 Visão Geral

Este documento explica como configurar as variáveis de ambiente para o frontend
React, garantindo que as chamadas de API funcionem tanto em desenvolvimento
quanto em produção.

## 🚀 Variáveis de Ambiente

### `REACT_APP_API_URL`

**Descrição:** URL base da API do backend

**Valores:**

- **Desenvolvimento:** `http://localhost:3001`
- **Produção:** `https://seu-backend.vercel.app` (ou sua URL de produção)

**Exemplo:**

```bash
# .env (desenvolvimento)
REACT_APP_API_URL=http://localhost:3001

# .env (produção)
REACT_APP_API_URL=https://coletor-de-leads.vercel.app
```

## 📁 Arquivos de Configuração

### 1. Arquivo `.env` (local - não commitado)

```bash
# Crie este arquivo na raiz do projeto
REACT_APP_API_URL=http://localhost:3001
```

### 2. Arquivo `frontend.env.example` (exemplo - commitado)

```bash
# Configuração da API do Backend
REACT_APP_API_URL=http://localhost:3001
```

## 🔄 Como Funciona

O sistema de configuração é inteligente e funciona da seguinte forma:

1. **Se `REACT_APP_API_URL` estiver definida:** Usa essa URL
2. **Se não estiver definida:**
   - Em desenvolvimento: Usa `http://localhost:3001`
   - Em produção: Usa `https://coletor-de-leads.vercel.app`

## 📝 Configuração por Ambiente

### Desenvolvimento Local

```bash
# .env
REACT_APP_API_URL=http://localhost:3001
```

### Produção (Vercel)

```bash
# Variáveis de ambiente no Vercel
REACT_APP_API_URL=https://coletor-de-leads.vercel.app
```

## ✅ Verificação

Para verificar se a configuração está funcionando:

1. Abra o console do navegador
2. Verifique se as URLs das APIs estão corretas
3. Teste uma chamada de API

## 🚨 Importante

- **Todas as variáveis do React devem começar com `REACT_APP_`**
- O arquivo `.env` não deve ser commitado no Git
- Use `frontend.env.example` como template
- Reinicie o servidor de desenvolvimento após alterar variáveis de ambiente

## 🔍 Troubleshooting

### Problema: APIs ainda apontando para localhost em produção

**Solução:** Verifique se `REACT_APP_API_URL` está configurada corretamente no
Vercel

### Problema: Erro de CORS em produção

**Solução:** Verifique se o backend está configurado para aceitar requisições da
origem correta

### Problema: Variáveis não sendo carregadas

**Solução:** Reinicie o servidor de desenvolvimento após alterar o arquivo
`.env`
