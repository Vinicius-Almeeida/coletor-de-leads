# Melhores Práticas e Conceitos Fundamentais do n8n

## 1. Estrutura de um Workflow

- **Trigger Node:** O nó que inicia o workflow (ex: Schedule, Webhook, On App
  Event). Todo workflow começa com um.
- **Action Nodes:** Nós que executam ações (ex: HTTP Request, Read from
  Database, Send Email).
- **Data & Logic Nodes:** Nós que manipulam dados (ex: Set, Merge, IF, Switch,
  Edit Fields).

## 2. O Fluxo de Dados (Data Flow)

- Cada nó passa seus dados para o próximo nó. Os dados de um nó anterior podem
  ser acessados usando expressões, como `{{ $json.body.id }}`.
- O nó `Set` é fundamental para criar ou modificar variáveis que serão usadas em
  nós subsequentes.
- Use a "Pin" functionality no editor para visualizar os dados de saída de cada
  nó e facilitar a construção de expressões.

## 3. Tratamento de Erros

- É crucial ter um workflow dedicado para tratar erros, que é acionado pelo nó
  "Error Trigger".
- Nos nós críticos (como uma requisição HTTP), configure a opção "Continue On
  Fail" na aba "Settings" para evitar que o workflow inteiro pare por uma única
  falha.

## 4. Gerenciamento de Credenciais

- **NUNCA** coloque chaves de API, tokens ou senhas diretamente nos nós.
- **SEMPRE** use o sistema de "Credentials" nativo do n8n. Ele armazena as
  informações de forma segura e criptografada.

## 5. Otimização e Performance

- Para processar grandes volumes de dados (ex: mais de 100 itens), use o nó
  "Split in Batches" para dividir a carga e evitar sobrecarga de memória.
- Ative a opção "Save execution progress to the database" em workflows longos
  para poder resumir a execução em caso de falha.

## 6. Modularização com Sub-Workflows

- Para lógicas complexas e reutilizáveis, crie um workflow separado e chame-o
  usando o nó "Execute Workflow". Isso mantém seus workflows principais limpos e
  fáceis de manter.
