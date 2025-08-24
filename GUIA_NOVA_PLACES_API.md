# 🔧 Guia para Habilitar a Nova Places API

## 🚨 Problema Identificado

O Google está descontinuando a **Places API (Legacy)** e forçando o uso da
**Places API (New)**. Por isso você está recebendo erros 403 (Forbidden).

## 🔧 Solução: Habilitar a Nova Places API

### **Passo 1: Acesse o Google Cloud Console**

1. Vá para: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Selecione o projeto onde sua API key está

### **Passo 2: Habilite a Nova Places API**

1. No menu lateral, clique em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Places API (New)"**
3. Clique em **"Places API (New)"** e depois em **"Ativar"**

### **Passo 3: Configure as Restrições da API Key**

1. No menu lateral, clique em **"APIs e Serviços"** → **"Credenciais"**
2. Clique na sua API key existente
3. Em **"Restrições de aplicativo"**, selecione **"APIs"**
4. **Remova** a "Places API (Legacy)" se estiver lá
5. **Adicione** a "Places API (New)"
6. Clique em **"Salvar"**

### **Passo 4: Verifique as Quotas**

1. No menu lateral, clique em **"APIs e Serviços"** → **"Quotas"**
2. Procure por **"Places API (New)"**
3. Verifique se você tem quota disponível

## 📋 Diferenças entre as APIs

### **Places API (Legacy) - DESCONTINUADA**

- URL: `https://maps.googleapis.com/maps/api/place/`
- Método: GET com parâmetros
- Status: ❌ Descontinuada

### **Places API (New) - ATUAL**

- URL: `https://places.googleapis.com/v1/`
- Método: POST com JSON
- Status: ✅ Recomendada

## 🧪 Como Testar

Após habilitar a nova API, execute:

```bash
python main.py
```

Você deve ver:

```
✅ API key válida!
📡 Fazendo busca textual: 'rolamentos Itajaí'
✅ Fase 1 concluída: X empresas encontradas
```

## 💰 Custos da Nova API

### **Plano Gratuito:**

- **1000 requisições/dia** gratuitas
- **$0.017** por 1000 requisições adicionais
- Mesmo preço da API antiga

### **Monitoramento:**

- Acesse: https://console.cloud.google.com/apis/credentials
- Veja o uso em tempo real
- Configure alertas de uso

## 🚨 Troubleshooting

### **Erro 403 (Forbidden)**

- ✅ Habilite a "Places API (New)"
- ✅ Configure as restrições da API key
- ✅ Aguarde alguns minutos após a ativação

### **Erro 400 (Bad Request)**

- ✅ Verifique se a API key está correta
- ✅ Confirme se a API está habilitada

### **Erro 429 (Too Many Requests)**

- ✅ Você atingiu o limite diário
- ✅ Aguarde até o próximo dia

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique se seguiu todos os passos
2. Confirme se a "Places API (New)" está ativa
3. Teste a API key no console do Google
4. Verifique as restrições da API key

---

**🎉 Após habilitar a nova API, você poderá buscar rolamentos em Itajaí e outras
empresas!**
