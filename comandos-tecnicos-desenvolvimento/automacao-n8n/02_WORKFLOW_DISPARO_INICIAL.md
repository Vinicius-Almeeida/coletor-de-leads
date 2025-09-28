# O Objetivo deste fluxo é buscar o whatsapp do lead no banco de dado supabase, verificar se o whatsapp existe, validar o número, se o numero for válido ele encaminha para o agente e para o nó merge que envia para o nó code montar o corpo da mensagem e enviar para o nó http disparar para o lead.

# Eu estou usando um nó code como "banco de dados"para teste, mas assim que o fluxo estiver alinhado, este nó será substituido pelo nó http que busca o whatsapp no banco

{ "name": "My workflow", "nodes": [ { "parameters": { "content": "## Campanha de
Outreach Automatizada 🚀\n\nEste fluxo automatiza sua campanha de prospecção de
leads:\n\n1. **Iniciar Campanha**: Gatilho manual para começar.\n2. **Buscar
Leads**: Coleta dados de `leads` no Supabase.\n3. **Loop Para Cada Lead**:
Processa cada lead individualmente.\n4. **Ramos Paralelos**: Valida e envia
mensagens via WhatsApp e/ou envia dados para CRM via Email.\n5. **Aguardar**:
Pausa aleatória entre leads para uma cadência humana.\n\nPreencha os
placeholders como `SUA_INSTANCIA`, `SEU_TOKEN`, `URL_DE_VALIDACAO_DE_EMAIL`, e
`URL_DO_WEBHOOK_DO_SEU_CRM` com suas credenciais e URLs reais.", "height": 400,
"width": 460 }, "position": [ -848, -288 ], "name": "Workflow Explanation",
"type": "n8n-nodes-base.stickyNote", "id":
"generated-9b97261f-e0bc-4e84-9678-0fc9ed1720c6" }, { "parameters": { "content":
"## Ramo de Automação de WhatsApp 💬\n\nEste ramo cuida da comunicação via
WhatsApp:\n\n1. **Verifica se Existe WhatsApp**: Garante que o lead tem um
número de WhatsApp.\n2. **Validar Número no WhatsApp**: Usa uma API externa para
verificar a validade do número.\n3. **Número é Válido?**: Confere o resultado da
validação.\n4. **Gerar Mensagem com IA**: Cria uma mensagem personalizada e
proativa usando Google Gemini.\n5. **Disparar Mensagem no WhatsApp**: Envia a
mensagem gerada para o lead.", "height": 392, "width": 450, "color": 4 },
"type": "n8n-nodes-base.stickyNote", "name": "WhatsApp Branch Explanation",
"position": [ -352, -288 ], "id":
"generated-821d055d-3e32-4906-a2d7-df695c0f03d2" }, { "parameters": { "content":
"## Ramo de Automação de Email 📧\n\nEste ramo foca na comunicação por email e
CRM:\n\n1. **Verifica se Existe Email**: Garante que o lead tem um endereço de
email.\n2. **Validar Endereço de Email**: Usa uma API externa para verificar a
validade do email.\n3. **Email é Válido?**: Confere o resultado da
validação.\n4. **Enviar Lead para CRM**: Envia os dados do lead para o seu CRM
via webhook.", "height": 384, "width": 450, "color": 5 }, "position": [ 128,
-288 ], "name": "Email Branch Explanation", "type": "n8n-nodes-base.stickyNote",
"id": "generated-67241d01-be0f-46ac-b619-45b534320b85" }, { "parameters": {},
"type": "n8n-nodes-base.manualTrigger", "name": "Iniciar Campanha de Outreach",
"position": [ -1104, 208 ], "id":
"generated-736f0d39-aa7f-4f25-8898-d7c3b7609973" }, { "parameters": { "options":
{ "reset": false } }, "name": "Loop Para Cada Lead", "type":
"n8n-nodes-base.splitInBatches", "position": [ -448, 208 ], "id":
"generated-9c3042dd-3e36-49c9-a4a6-ed91c6e1748f" }, { "parameters": {
"conditions": { "options": { "caseSensitive": false, "leftValue": "",
"typeValidation": "strict", "version": 1 }, "conditions": [ { "id":
"458cc8d6-d656-42ac-ab91-0c1d9455dde3", "leftValue": "={{ $json.whatsapp }}",
"rightValue": "", "operator": { "type": "string", "operation": "notEmpty",
"singleValue": true } } ], "combinator": "and" }, "options": { "ignoreCase":
true, "looseTypeValidation": true } }, "name": "Verifica se Existe WhatsApp",
"type": "n8n-nodes-base.if", "position": [ -176, 224 ], "id":
"generated-9cd16e7c-dbda-4df1-92be-fa34ab9dc0c6" }, { "parameters": {
"conditions": { "options": { "caseSensitive": false, "leftValue": "",
"typeValidation": "strict", "version": 1 }, "conditions": [ { "id":
"582d3dcd-d74a-446f-b6fa-8ead7b744066", "leftValue": "={{ $(\"Validar Número no
Whatsapp\").item.json.exists }}", "rightValue": "", "operator": { "type":
"boolean", "operation": "true", "singleValue": true } } ], "combinator": "and"
}, "options": { "ignoreCase": true, "looseTypeValidation": true } }, "position":
[ 304, 208 ], "name": "Número é Válido?", "type": "n8n-nodes-base.if", "id":
"generated-bcc9955a-c365-47e4-9a96-3bf68f1f4303" }, { "parameters": {
"conditions": { "string": [ { "operation": "isNotEmpty", "value1": "={{
$json.email }}" } ] }, "options": { "ignoreCase": true, "looseTypeValidation":
true } }, "type": "n8n-nodes-base.if", "position": [ 720, 816 ], "name":
"Verifica se Existe Email", "id":
"generated-919beead-994d-4944-9fa0-bf1383f05f4b" }, { "parameters": { "url":
"URL_DE_VALIDACAO_DE_EMAIL?email={{ $json.email }}", "options": { "batching":
{}, "allowUnauthorizedCerts": false, "lowercaseHeaders": true, "redirect": {},
"response": {}, "pagination": {}, "proxy": "", "timeout": 10000 } }, "name":
"Validar Endereço de Email", "position": [ 512, 816 ], "type":
"n8n-nodes-base.httpRequest", "id":
"generated-9f181452-38f9-4bbc-b6a3-ce64ba078ce7" }, { "parameters": {
"conditions": { "string": [ { "value1": "={{ $(\"Validar Endereço de
Email\").item.json.status }}", "value2": "valid", "operation": "equals" } ] },
"options": { "ignoreCase": true, "looseTypeValidation": true } }, "position": [
944, 816 ], "name": "Email é Válido?", "type": "n8n-nodes-base.if", "id":
"generated-15795424-2c63-4089-bda4-8b6f71c56eb3" }, { "parameters": { "method":
"POST", "url": "URL_DO_WEBHOOK_DO_SEU_CRM", "sendBody": true, "specifyBody":
"json", "jsonBody": "{\"name\": \"{{ $json.name }}\", \"email\":
\"{{ $json.email }}\", \"service_of_interest\":
\"{{ $json.service_of_interest }}\"}", "options": { "batching": {},
"allowUnauthorizedCerts": false, "lowercaseHeaders": true, "redirect": {},
"response": {}, "pagination": {}, "proxy": "", "timeout": 10000 } }, "position":
[ -448, 816 ], "name": "Enviar Lead para CRM", "type":
"n8n-nodes-base.httpRequest", "id":
"generated-e0967e1a-5055-4cde-9ac6-ca6b05fd4432" }, { "parameters": { "amount":
"={{ Math.floor(Math.random() * (120 - 60 + 1)) + 60 }}" }, "position": [ -240,
816 ], "type": "n8n-nodes-base.wait", "name": "Aguardar Próximo Lead", "id":
"generated-e2d16079-1f85-4571-ad7e-8134ff4c2057", "webhookId":
"2dca58d1-0c9a-4150-95ba-145998cfa8bc" }, { "parameters": { "url":
"https://yujkvduafxqumemhwgbt.supabase.co/rest/v1/leads?select=whatsapp",
"authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth",
"options": {} }, "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2,
"position": [ 304, 816 ], "id": "b74d7505-f69d-4c04-b0bc-9c61744d4ad7", "name":
"Buscar Leads Supabase via API ", "credentials": { "httpHeaderAuth": { "id":
"ig1qcB55UDx0djXD", "name": "Header Auth account" } } }, { "parameters": {},
"type": "n8n-nodes-base.noOp", "typeVersion": 1, "position": [ 128, 432 ], "id":
"ce7e4d4e-9feb-44be-a2ca-0b563271c333", "name": "No Operation, do nothing" }, {
"parameters": { "url":
"=https://api.z-api.io/instances/3E69AE340290B00ECD846EC2C5F8FD4F/token/24B7C9177F8152B9FFF3A9E1/phone-exists/{{
$json.whatsapp }}", "sendHeaders": true, "headerParameters": { "parameters": [ {
"name": "Client-Token", "value": "Fc150578153ce4a73b1d46133520b0a9fS" } ] },
"options": {} }, "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2,
"position": [ 112, 208 ], "id": "62b8404b-0764-4370-a1e2-fe77d34299ae", "name":
"Validar Número no Whatsapp" }, { "parameters": { "options": {} }, "type":
"@n8n/n8n-nodes-langchain.agent", "typeVersion": 2.2, "position": [ -32, 816 ],
"id": "ca74d9fb-8e05-4c77-b3e3-dc7da59051aa", "name": "AI Agent" }, {
"parameters": { "modelId": { "\_\_rl": true, "value": "models/gemini-2.5-flash",
"mode": "list", "cachedResultName": "models/gemini-2.5-flash" }, "messages": {
"values": [ { "content": "Sua única e exclusiva tarefa é escrever uma única
mensagem de prospecção para WhatsApp e retornar APENAS O TEXTO da
mensagem.\n\nREGRAS ABSOLUTAS:\n1. NÃO adicione introduções como \"Aqui está a
mensagem:\", \"Com certeza!\", ou \"Olá,\".\n2. NÃO dê múltiplas opções (Opção
1, Opção 2). Gere apenas UMA mensagem.\n3. NÃO inclua explicações, asteriscos,
formatação em negrito, ou qualquer texto que não seja a mensagem em si.\n4. A
mensagem deve ser curta (máximo 2 frases) e terminar com uma pergunta
simples.\n5. Exemplo de saída CORRETA: \"Olá, tudo bem!?, vi que sua empresa
atua com tecnologia e tive uma ideia que pode ser útil. Faz sentido para
você?\"" } ] }, "options": {} }, "type":
"@n8n/n8n-nodes-langchain.googleGemini", "typeVersion": 1, "position": [ 560,
304 ], "id": "ca346295-4364-4e2a-9fd5-f63c4b43ad08", "name": "Gerar Mensagem com
IA", "credentials": { "googlePalmApi": { "id": "hYZZbhLbvkSVsfDa", "name":
"Google-gemini" } } }, { "parameters": { "jsCode": "// Este código simula a
saída do Google Sheets.\n// Adicione quantos números de teste você quiser aqui
dentro.\n\nconst testLeads = [\n {\n whatsapp: '5511975711040' // SUBSTITUA PELO
SEU WHATSAPP REAL (ex: 5547999998888)\n },\n {\n whatsapp: '554898448722' //
Este é um teste para um lead sem número\n },\n {\n whatsapp: '' // Este é um
teste para um lead sem número\n },\n {\n whatsapp: '5511000000000' // Este é um
teste para um número inválido\n }\n];\n\n// O n8n espera que os dados sejam
retornados neste formato\nreturn testLeads.map(lead => ({ json: lead }));" },
"type": "n8n-nodes-base.code", "typeVersion": 2, "position": [ -880, 208 ],
"id": "83a07724-667d-4124-b877-5a61b75533d5", "name": "Code" }, { "parameters":
{ "method": "POST", "url":
"https://api.z-api.io/instances/3E69AE340290B00ECD846EC2C5F8FD4F/token/24B7C9177F8152B9FFF3A9E1/send-text",
"sendHeaders": true, "headerParameters": { "parameters": [ { "name":
"Client-Token", "value": "Fc150578153ce4a73b1d46133520b0a9fS" } ] }, "sendBody":
true, "specifyBody": "json", "jsonBody": "={\n\"phone\": \"{{ $json.phone }}\",
\n\"message\": \"{{ $json.message }}\"\n}", "options": {} }, "type":
"n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [ 1264, 208 ],
"id": "7c010106-c4d7-47d3-bbe1-d2600b49177a", "name": "Disparar Mensagem no
WhatsApp" }, { "parameters": { "jsCode": "// Pega os dados que o nó Merge juntou
na etapa anterior\nconst inputData = $input.first().json;\n\n// Cria o objeto
FINAL que a Z-API precisa.\nconst finalBody = {\n phone: inputData.phone,\n
message: inputData.content.parts[0].text \n};\n\n// Retorna um novo item do n8n
contendo APENAS esse objeto.\n// A saída deste nó será um JSON limpo, sem dados
extras.\nreturn {\n json: finalBody\n};" }, "type": "n8n-nodes-base.code",
"typeVersion": 2, "position": [ 1088, 208 ], "id":
"fcca8c8a-98d0-4aae-9450-f1d3fbc54080", "name": "Montar Corpo da Mensagem" }, {
"parameters": { "mode": "combine", "combineBy": "combineByPosition", "options":
{} }, "type": "n8n-nodes-base.merge", "typeVersion": 3.2, "position": [ 912, 208
], "id": "0058fdd6-3272-4ad1-a810-47ba5ea5c407", "name": "Merge",
"alwaysOutputData": false, "executeOnce": false, "retryOnFail": false }, {
"parameters": {}, "type": "n8n-nodes-base.wait", "typeVersion": 1.1, "position":
[ 1456, 208 ], "id": "20191a14-c972-4f21-b8d2-9bf2679633ad", "name": "Wait",
"webhookId": "d3aa75a0-8d26-4175-9f00-81094d08aada" }, { "parameters": {
"assignments": { "assignments": [ { "id":
"8624c744-5b3b-46a7-af16-1edff03888c2", "name": "whatsapp", "value": "={{
$json.whatsapp }}", "type": "string" } ] }, "options": {} }, "type":
"n8n-nodes-base.set", "typeVersion": 3.4, "position": [ -672, 208 ], "id":
"26020d94-ba65-43af-9f89-1163e7d30417", "name": "Edit Fields" } ], "pinData":
{}, "connections": { "Iniciar Campanha de Outreach": { "main": [ [ { "node":
"Code", "type": "main", "index": 0 } ] ] }, "Validar Endereço de Email": {
"main": [ [] ] }, "Enviar Lead para CRM": { "main": [ [ { "node": "Aguardar
Próximo Lead", "type": "main", "index": 0 } ] ] }, "Buscar Leads Supabase via
API ": { "main": [ [] ] }, "Loop Para Cada Lead": { "main": [ [], [ { "node":
"Verifica se Existe WhatsApp", "type": "main", "index": 0 } ] ] }, "Verifica se
Existe WhatsApp": { "main": [ [ { "node": "Validar Número no Whatsapp", "type":
"main", "index": 0 } ], [ { "node": "No Operation, do nothing", "type": "main",
"index": 0 } ] ] }, "Validar Número no Whatsapp": { "main": [ [ { "node":
"Número é Válido?", "type": "main", "index": 0 } ] ] }, "Número é Válido?": {
"main": [ [ { "node": "Merge", "type": "main", "index": 0 }, { "node": "Gerar
Mensagem com IA", "type": "main", "index": 0 } ] ] }, "Gerar Mensagem com IA": {
"main": [ [ { "node": "Merge", "type": "main", "index": 1 } ] ] }, "Code": {
"main": [ [ { "node": "Edit Fields", "type": "main", "index": 0 } ] ] }, "Montar
Corpo da Mensagem": { "main": [ [ { "node": "Disparar Mensagem no WhatsApp",
"type": "main", "index": 0 } ] ] }, "Merge": { "main": [ [ { "node": "Montar
Corpo da Mensagem", "type": "main", "index": 0 } ] ] }, "Aguardar Próximo Lead":
{ "main": [ [] ] }, "Disparar Mensagem no WhatsApp": { "main": [ [ { "node":
"Wait", "type": "main", "index": 0 } ] ] }, "Edit Fields": { "main": [ [ {
"node": "Loop Para Cada Lead", "type": "main", "index": 0 } ] ] } }, "active":
false, "settings": { "executionOrder": "v1" }, "versionId":
"41e6b03b-7913-46d9-b769-f2cd4ddfde06", "meta": { "templateCredsSetupCompleted":
true, "instanceId":
"c196c599ed60286428f03114436b212ffa8cb5e755928064a58ceac4aaff808a" }, "id":
"XZRBmDbKP9ETTvne", "tags": [] }
