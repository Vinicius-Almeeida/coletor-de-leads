# MANIFESTO DO PROJETO: Plataforma 3ian Pulse

## 1. Visão do Produto

Criar a plataforma de atendimento omnichannel mais inteligente e intuitiva para
pequenas e médias empresas no Brasil, transformando a comunicação com o cliente
em um motor de crescimento através de automação e análise de dados.

## 2. Problemas a Serem Resolvidos

- Comunicação Fragmentada: Equipes perdidas entre WhatsApp, Instagram, e-mail,
  etc.
- Atendimento Lento e Inconsistente: Demora nas respostas e falta de padrão.
- Perda de Oportunidades: Leads não qualificados ou esquecidos por falta de
  follow-up.
- Falta de Visibilidade: Gestores não conseguem medir a performance da equipe de
  atendimento.
- Tarefas Manuais: Excesso de tempo gasto em tarefas repetitivas.

## 3. Público-Alvo

- Usuário Primário: Operadores de atendimento, equipes de vendas e suporte de
  PMEs.
- Usuário Secundário: Gestores e donos de empresas que precisam de visibilidade
  e controle.

## 4. Proposta de Valor Única (PVU)

Diferente de simples agregadores de chat, a **Plataforma 3ian Pulse** se destaca
por seu **Motor de IA Intuitivo**, que permite a qualquer usuário criar
automações complexas sem precisar de conhecimento técnico, e por sua **Análise
de Sentimento**.

## 5. Escopo Macro (Módulos do "Plano Ferrari")

1. Painel de Controle e Conexões
2. Atendimentos (Kanban Board)
3. Gestão de Usuários e Permissões
4. Motor de IA e Intenções
5. Disparo de Mensagens e Agendamentos
6. Dashboards e Relatórios (BI)
7. Automação Visual de Fluxos (Followup)

## 6. Stack Tecnológica Preliminar

- Frontend: React (Vite) com TypeScript, Tailwind CSS.
- Backend: Node.js (Express ou Fastify) com TypeScript, Prisma ORM.
- Banco de Dados: PostgreSQL.
- Comunicação Real-time: WebSockets (Socket.IO).
- IA Generativa: Google Gemini API.

## 7. Princípios de Desenvolvimento

- API-First: O backend será construído como uma API robusta.
- Component-Based UI: O frontend será construído com componentes reutilizáveis.
- Clean Code & SOLID: Seguiremos os princípios de código limpo.
- Segurança por Design: A segurança será uma prioridade desde o início.

## 8. Ambiente de Desenvolvimento

Para garantir consistência entre os ambientes de desenvolvimento local e de
CI/CD, as seguintes versões de ferramentas são mandatórias. Esta seção é a fonte
da verdade para a configuração do ambiente e deve ser seguida rigorosamente para
evitar erros de incompatibilidade.

| Ferramenta  | Versão Mandatória | Observações                                                                                                          |
| :---------- | :---------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Node.js** | `20.x`            | Recomenda-se a versão LTS mais recente. O uso de um gerenciador de versões como `nvm` é fortemente aconselhado.      |
| **npm**     | `10.x+`           | Versão que é distribuída com o Node.js 20. Garante a consistência na instalação de pacotes e na execução de scripts. |

## 9. Diretrizes Críticas de Desenvolvimento (Do's and Don'ts)

As diretrizes abaixo foram estabelecidas a partir das lições aprendidas na
Fase 0. O cumprimento destas regras **não é opcional** e visa garantir a
segurança, estabilidade e manutenibilidade do projeto, evitando a repetição de
erros que nos custaram tempo de desenvolvimento.

| Categoria                   | ✅ **Fazer (Do)**                                                                                                                    | ❌ **Não Fazer (Don't)**                                                                                                                                                      |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ambiente e Dependências** | Sempre iniciar o desenvolvimento validando as versões de Node.js e `npm` definidas na Seção 8.                                       | Instalar pacotes que exijam uma versão de Node.js superior à definida no manifesto sem uma discussão prévia de arquitetura.                                                   |
| **Segurança e Segredos**    | Gerenciar todas as chaves de API, senhas e segredos exclusivamente através de variáveis de ambiente (`.env`).                        | **NUNCA** commitar chaves, tokens ou qualquer informação sensível em **NENHUM** arquivo do repositório, incluindo documentação e testes.                                      |
| **Testes Automatizados**    | Escrever testes de unidade que sejam isolados e rápidos. Use **"mocks"** para simular dependências externas (APIs, bancos de dados). | **NUNCA** escrever testes que dependam de serviços externos reais (chamadas de rede) no pipeline de CI. Testes de unidade devem passar sem conexão com a internet.            |
| **Pipeline de CI/CD**       | Garantir que 100% dos testes rodem no pipeline. O pipeline é a nossa fonte da verdade sobre a qualidade do código.                   | **NUNCA** desabilitar, pular (`.skip`) ou ignorar erros em testes no pipeline como um atalho para fazer o build passar. Se um teste falha, o problema **deve** ser corrigido. |
