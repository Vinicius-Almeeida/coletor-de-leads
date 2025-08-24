# 🚀 Coletor Híbrido de Leads

Sistema inteligente de coleta de leads empresariais usando Google Places API + Web Scraping ético.

## 🔒 Configuração Segura da API

### 1. Instalar dependências
```bash
pip install -r requirements.txt
```

### 2. Configurar chave da API (OBRIGATÓRIO)

**IMPORTANTE:** A chave da API NÃO será enviada para o GitHub por segurança!

1. Crie um arquivo `.env` na raiz do projeto:
```bash
# Windows
echo GOOGLE_PLACES_API_KEY=sua_chave_aqui > .env

# Linux/Mac
touch .env
echo "GOOGLE_PLACES_API_KEY=sua_chave_aqui" > .env
```

2. Substitua `sua_chave_aqui` pela sua chave real da Google Places API

### 3. Como obter a chave da API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a **Places API (New)**
4. Crie credenciais (API Key)
5. Configure restrições de segurança (recomendado)

📖 **Guia completo:** Veja `GUIA_NOVA_PLACES_API.md`

## 🚀 Como usar

### Interface Web (Recomendado)
```bash
python app_web.py
```
Acesse: http://localhost:5000

### Interface CLI
```bash
python main.py
```

## 📊 Funcionalidades

- ✅ **Fase 1:** Coleta via Google Places API (dados confiáveis)
- ✅ **Fase 2:** Scraping ético de sites (dados adicionais)
- ✅ **Campo WhatsApp:** Extração automática de números
- ✅ **Dashboard:** Visualização organizada por segmentos
- ✅ **Filtros:** Busca e filtragem avançada
- ✅ **Exportação:** Download em CSV
- ✅ **Tempo real:** Status de progresso

## 🔧 Estrutura do Projeto

```
projeto-mini-scraper-leads/
├── app_web.py              # Interface web Flask
├── main.py                 # Interface CLI
├── api_handler.py          # Integração Google Places API
├── scraper.py              # Scraping ético de sites
├── config.py               # Configurações seguras
├── requirements.txt        # Dependências
├── .env                    # Chave da API (NÃO enviar para GitHub!)
├── .gitignore             # Proteção de arquivos sensíveis
├── templates/              # Templates HTML
│   ├── index.html
│   ├── dashboard.html
│   └── whatsapp_leads.html
└── README.md
```

## 🛡️ Segurança

- ✅ Chave da API protegida em `.env`
- ✅ `.gitignore` configurado
- ✅ Rate limiting implementado
- ✅ User-Agent realista
- ✅ Timeouts configurados
- ✅ Tratamento de erros robusto

## 📝 Licença

Este projeto é para uso educacional e comercial legítimo.

---

**⚠️ IMPORTANTE:** Nunca compartilhe sua chave da API ou envie o arquivo `.env` para o GitHub!
