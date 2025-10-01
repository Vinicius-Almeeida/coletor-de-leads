# 03_POLITICA_DE_GOVERNANCA_E_SEGURANCA_DE_DADOS.md

## 1. Objetivo e Escopo

O objetivo desta política é garantir que todos os dados de clientes e usuários
da Plataforma 3ian Pulse sejam coletados, processados, armazenados e descartados
com o mais alto nível de segurança, integridade e em estrita conformidade com a
legislação aplicável, notavelmente a LGPD. Esta política se aplica a todos os
aspectos do produto, desde a arquitetura do banco de dados até a interface do
usuário.

## 2. Conformidade Regulatória: Lei Geral de Proteção de Dados (LGPD)

A plataforma será desenvolvida sob os princípios da LGPD, que incluem:

- **Finalidade:** Coletar dados apenas para propósitos legítimos, específicos e
  informados ao titular.
- **Necessidade:** Limitar a coleta ao mínimo necessário para a realização das
  finalidades.
- **Transparência:** Fornecer informações claras aos titulares sobre o
  tratamento de seus dados.
- **Segurança:** Utilizar medidas técnicas e administrativas para proteger os
  dados.
- **Não Discriminação:** Impossibilidade de realizar o tratamento para fins
  discriminatórios.

## 3. Classificação dos Dados

Todos os dados na plataforma serão classificados para determinar o nível de
proteção exigido:

- **Nível 3 (Confidencial/Sensível):** Dados Pessoais de titulares (nome,
  e-mail, telefone), conteúdo de mensagens trocadas, credenciais de acesso,
  tokens de API. Exigem o mais alto nível de proteção.
- **Nível 2 (Restrito):** Dados de uso da plataforma, metadados de negócios do
  cliente, configurações de automação.
- **Nível 1 (Interno):** Logs de sistema não personalizados, métricas de
  performance anônimas.

## 4. Pilares da Segurança de Dados na Arquitetura

| Pilar                         | Diretriz de Implementação                                                                                                                                                                                                                        | Conexão com o Projeto                                                                               |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Criptografia**              | **Em Trânsito:** Toda a comunicação entre cliente-servidor e servidor-servidor será obrigatoriamente via TLS 1.3+. <br> **Em Repouso:** Dados de Nível 3 (especialmente credenciais e tokens) serão criptografados no banco de dados PostgreSQL. | Princípio de "API-First" e "Segurança por Design".                                                  |
| **Controle de Acesso (RBAC)** | Será implementado um modelo de Role-Based Access Control. O acesso aos dados será concedido com base no princípio do "privilégio mínimo".                                                                                                        | A **Fase 1** inicia este pilar com a criação dos campos `role` e `status` no modelo `User`.         |
| **Ciclo de Vida dos Dados**   | Políticas claras de retenção serão definidas. Será implementada uma funcionalidade para a "exclusão forte" (hard delete) de dados mediante solicitação do titular (cliente), garantindo o "direito ao esquecimento".                             | Essencial para conformidade com a LGPD.                                                             |
| **Auditoria e Monitoramento** | Todas as operações de acesso, criação, modificação e exclusão de dados de Nível 3 serão registradas em logs de auditoria imutáveis.                                                                                                              | Permitirá rastrear quem fez o quê e quando, crucial para investigações de segurança e conformidade. |
| **Prevenção de Injeção**      | O uso do Prisma ORM é mandatório para todas as interações com o banco de dados, a fim de mitigar por design os riscos de ataques de SQL Injection.                                                                                               | Garante a proteção contra uma das vulnerabilidades mais comuns e perigosas da web.                  |

## 5. Fundamentação e Validação de Mercado

Nossas escolhas arquitetônicas são fundamentadas em padrões da indústria e
tecnologias com eficácia comprovada em ambientes de alta segurança e
conformidade.

- **Prisma ORM para Prevenção de SQL Injection:** A abordagem do Prisma de usar
  queries parametrizadas é a defesa recomendada pelo OWASP contra ataques de SQL
  Injection. Ele separa a lógica da consulta dos dados do usuário, prevenindo
  que entradas maliciosas manipulem o banco de dados.
- **PostgreSQL para Conformidade (LGPD):** O PostgreSQL oferece mecanismos
  avançados como Row-Level Security (RLS), que permite a implementação de regras
  de acesso em nível de linha, um requisito técnico fundamental para plataformas
  multi-tenant (que atendem múltiplos clientes) e para a conformidade com a
  LGPD.
- **Controle de Acesso (RBAC) como Padrão da Indústria:** O modelo RBAC é um
  padrão de segurança estabelecido e recomendado por órgãos como o NIST
  (National Institute of Standards and Technology), sendo a base para a gestão
  de permissões em plataformas como AWS, Google Cloud e em empresas como a
  Netflix.
- **Stack Tecnológico (Node.js, TypeScript, React):** Esta é a base tecnológica
  de empresas líderes de mercado como Microsoft, Airbnb e Netflix, o que valida
  sua maturidade, segurança e escalabilidade para aplicações web modernas.

## 6. Responsabilidades

Todos os membros da equipe de desenvolvimento são responsáveis por compreender e
implementar esta política em cada linha de código. O Product Owner / Arquiteto
Chefe é responsável por garantir a conformidade da arquitetura e das
funcionalidades com esta política.
