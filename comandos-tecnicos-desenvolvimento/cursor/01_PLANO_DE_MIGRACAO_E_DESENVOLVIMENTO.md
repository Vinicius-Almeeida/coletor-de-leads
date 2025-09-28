# PLANO DE MIGRAÇÃO E DESENVOLVIMENTO MVP

## Visão Estratégica

A estratégia atual é focar no lançamento de um MVP (Produto Mínimo Viável)
baseado no projeto existente "Coletor de Leads" para gerar receita. Após o
lançamento e validação do MVP, a receita será reinvestida para desenvolver a
"Plataforma 3ian Pulse" completa (o "Plano Ferrari").

## Foco do MVP: Coletor de Leads com Gestão de Acesso

O objetivo é aprimorar o Coletor de Leads com um sistema de gerenciamento de
usuários via Admin antes do lançamento.

### Fase 0: Preparação e Segurança

1.  **Atualização de Dependências:** Identificar e corrigir as 5
    vulnerabilidades críticas apontadas no relatório de segurança.
2.  **Correção dos Testes de Segurança:** Analisar e corrigir os 7/10 testes de
    segurança que falharam.
3.  **Refatoração de Variáveis de Ambiente:** Organizar as .env vars para o
    projeto atual e futuro.

### Fase 1: Implementação do Painel Admin

1.  **Banco de Dados:** Adicionar os campos `role` ('admin'/'user') e `status`
    ('active'/'pending') ao modelo `User`.
2.  **Backend:**
    - Criar um script para gerar o primeiro usuário 'admin'.
    - Implementar um middleware de autorização para rotas de admin.
    - Desenvolver endpoints de admin: `/api/admin/create-user`,
      `/api/admin/users`, `/api/admin/users/:userId/status`.
    - Ajustar o endpoint de login para identificar usuários com status
      'pending'.
    - Criar endpoint para o usuário finalizar o cadastro e troca de senha.
3.  **Frontend:**
    - Desenvolver uma nova área de Admin (`/admin`) com rotas protegidas.
    - Implementar a lógica de redirecionamento para troca de senha e finalização
      de cadastro no primeiro login do usuário.
