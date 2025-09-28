# 🔄 CI/CD Pipeline - Coletor de Leads

Este diretório contém os workflows de Integração Contínua (CI) e Entrega
Contínua (CD) para o projeto Coletor de Leads.

## 📋 Workflows Disponíveis

### `ci.yml` - Pipeline de Integração Contínua

**Disparado em:**

- Push para branches `main` e `develop`
- Pull Requests para branches `main` e `develop`

**Executa:**

1. **Backend Tests & Security Audit**

   - Instalação de dependências
   - Auditoria de segurança
   - Testes unitários
   - Testes de segurança

2. **Frontend Build & Tests**

   - Build da aplicação React
   - Testes do frontend
   - Verificação de cobertura

3. **General Security & Quality Checks**
   - Verificação de vulnerabilidades
   - Verificação de dependências desatualizadas
   - Verificação de dados sensíveis no código
   - Validação de arquivos de configuração

## 🔧 Configuração Necessária

### Repository Secrets

Para que o pipeline funcione corretamente, configure os seguintes secrets no
GitHub:

1. Acesse: `Settings > Secrets and variables > Actions`
2. Adicione os seguintes secrets:

```
DATABASE_URL_TEST=postgresql://test_user:test_password@localhost:5433/test_coletor_leads
SESSION_SECRET_TEST=test_session_secret_here
JWT_SECRET_TEST=test_jwt_secret_here
GOOGLE_PLACES_API_KEY_TEST=your_test_google_places_api_key
REACT_APP_API_URL_TEST=http://localhost:3001
```

### Variáveis de Ambiente

O projeto usa o arquivo `.env.example` como template. Certifique-se de que:

1. ✅ O arquivo `.env.example` existe na raiz do projeto
2. ✅ O arquivo `.env` está no `.gitignore`
3. ✅ Todas as variáveis necessárias estão documentadas

## 🚀 Como Funciona

### Em Push/Pull Request

1. **Checkout** do código
2. **Setup** do Node.js (versões 18 e 20)
3. **Instalação** de dependências
4. **Execução** de testes e auditorias
5. **Verificação** de qualidade e segurança
6. **Notificação** de resultado

### Critérios de Sucesso

Para que o pipeline passe, é necessário:

- ✅ Todos os testes unitários passarem
- ✅ Todos os testes de segurança passarem (10/10)
- ✅ Auditoria de segurança sem vulnerabilidades críticas
- ✅ Build do frontend sem erros
- ✅ Nenhuma informação sensível no código
- ✅ Arquivos de configuração presentes

### Bloqueio de Merge

Se qualquer verificação falhar:

- ❌ O merge será bloqueado
- 📋 Os logs de erro estarão disponíveis
- 🔧 Corrija os problemas e faça um novo push

## 📊 Status do Pipeline

O status do pipeline pode ser visualizado em:

- **Actions tab** do repositório GitHub
- **Checks** na página do Pull Request
- **Badge** no README principal (se configurado)

## 🛠️ Manutenção

### Adicionando Novos Testes

1. Adicione o teste no projeto
2. Atualize o script no `package.json` se necessário
3. O pipeline executará automaticamente

### Adicionando Novas Verificações

1. Edite o arquivo `.github/workflows/ci.yml`
2. Adicione o novo step no job apropriado
3. Teste localmente antes de fazer commit

### Troubleshooting

**Problema:** Pipeline falha com erro de dependências **Solução:** Execute
`npm ci` localmente e verifique se há problemas

**Problema:** Testes falham no CI mas passam localmente **Solução:** Verifique
as variáveis de ambiente e secrets

**Problema:** Build do frontend falha **Solução:** Verifique se todas as
dependências estão instaladas

## 📞 Suporte

Para dúvidas sobre o pipeline CI/CD:

1. Verifique os logs na aba Actions
2. Consulte este README
3. Abra uma issue no repositório
