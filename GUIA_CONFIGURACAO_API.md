# 🔑 Guia de Configuração da API Key - Google Places

## 📍 Onde Colocar a Chave API

### **Localização no Código:**
Abra o arquivo `main.py` e localize a **linha 19**:

```python
# Configurações
API_KEY = "SUA_CHAVE_API_AQUI"  # 🔑 SUBSTITUA AQUI: Cole sua chave da Google Places API
```

### **Como Substituir:**
Substitua `"SUA_CHAVE_API_AQUI"` pela sua chave real:

```python
# Configurações
API_KEY = "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz"  # 🔑 SUA CHAVE AQUI
NICHO_BUSCA = "consultoria financeira"  # 📋 Nicho padrão (pode ser alterado no menu)
CIDADE_BUSCA = "São Paulo"  # 🏙️ Cidade padrão (pode ser alterada no menu)
```

## 🔧 Como Obter a Chave API

### **Passo 1: Acesse o Google Cloud Console**
1. Vá para: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Crie um novo projeto ou selecione um existente

### **Passo 2: Habilite a Places API**
1. No menu lateral, clique em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Places API"**
3. Clique em **"Places API"** e depois em **"Ativar"**

### **Passo 3: Crie a Chave API**
1. No menu lateral, clique em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"+ Criar Credenciais"** → **"Chave de API"**
3. Sua chave será gerada automaticamente

### **Passo 4: Configure Restrições (Recomendado)**
1. Clique na chave criada para editá-la
2. Em **"Restrições de aplicativo"**, selecione **"APIs"**
3. Selecione apenas **"Places API"**
4. Clique em **"Salvar"**

## 📋 Exemplo de Configuração Completa

```python
# Configurações
API_KEY = "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz"  # 🔑 SUA CHAVE AQUI
NICHO_BUSCA = "marketing digital"  # 📋 Seu nicho de interesse
CIDADE_BUSCA = "Rio de Janeiro"    # 🏙️ Sua cidade de interesse
```

## ⚠️ Importante: Segurança da Chave

### **✅ Boas Práticas:**
- Mantenha sua chave privada
- Não compartilhe o arquivo `main.py` com a chave
- Use restrições de API no Google Cloud Console
- Monitore o uso no painel do Google Cloud

### **❌ Evite:**
- Compartilhar a chave publicamente
- Incluir a chave em repositórios públicos
- Usar a chave sem restrições

## 🧪 Como Testar se a Chave Funciona

### **Opção 1: Executar o Sistema**
```bash
python main.py
```
Se a chave estiver correta, você verá:
```
✅ API key válida!
```

### **Opção 2: Teste Rápido**
```bash
python exemplo_uso_interativo.py
```
O sistema validará automaticamente a chave.

## 💰 Custos e Limites

### **Plano Gratuito:**
- **1000 requisições/dia** gratuitas
- **$0.017** por 1000 requisições adicionais
- Ideal para uso pessoal e pequenos projetos

### **Monitoramento:**
- Acesse: https://console.cloud.google.com/apis/credentials
- Veja o uso em tempo real
- Configure alertas de uso

## 🚨 Troubleshooting

### **Erro: "API key inválida"**
- Verifique se a chave está correta
- Confirme se a Places API está habilitada
- Teste a chave no Google Cloud Console

### **Erro: "Quota exceeded"**
- Você atingiu o limite diário
- Aguarde até o próximo dia ou atualize o plano

### **Erro: "API not enabled"**
- Habilite a Places API no Google Cloud Console
- Aguarde alguns minutos após a ativação

## 📞 Suporte

Se tiver problemas:
1. Verifique se seguiu todos os passos
2. Confirme se a API está habilitada
3. Teste a chave no console do Google
4. Verifique as restrições de API

---

**🎉 Com a chave configurada, você está pronto para usar o Coletor Híbrido de Leads!**
