# 🚀 Quick Start - Coletor de Leads

## ⚡ Configuração Rápida (5 minutos)

### 1. Pré-requisitos

- ✅ Docker Desktop instalado
- ✅ Git instalado

### 2. Clone e Configure

```bash
git clone https://github.com/Vinicius-Almeeida/coletor-de-leads.git
cd projeto-mini-scraper-leads
```

### 3. Execute o Setup (Windows)

```powershell
.\setup-docker.ps1
```

### 4. Configure o .env

Edite o arquivo `.env` e configure:

- `DB_PASSWORD=sua_senha_segura`
- `GOOGLE_PLACES_API_KEY=sua_chave_api`

### 5. Inicie o Banco

```bash
docker-compose up -d db
```

### 6. Instale Dependências

```bash
# Backend
cd backend-js
npm install

# Frontend
cd ..
npm install
```

### 7. Execute o Projeto

```bash
# Terminal 1 - Backend
cd backend-js
npm start

# Terminal 2 - Frontend
npm start
```

## 🎯 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs do banco
docker-compose logs -f db

# Parar tudo
docker-compose down

# Conectar ao banco
docker-compose exec db psql -U coletor_user -d coletor_leads
```

## 🆘 Problemas Comuns

### Porta 5432 ocupada

```bash
# Windows
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Linux/Mac
sudo lsof -i :5432
sudo kill -9 <PID>
```

### Docker não inicia

- Verifique se o Docker Desktop está rodando
- Reinicie o Docker Desktop
- Execute `docker system prune` para limpar

## 📚 Próximos Passos

1. ✅ Ambiente configurado
2. 🔄 Integrar backend com PostgreSQL
3. 🔄 Implementar autenticação
4. 🔄 Configurar Redis
5. 🔄 Deploy em produção

---

**🎉 Pronto! Seu ambiente está configurado e pronto para desenvolvimento.**
