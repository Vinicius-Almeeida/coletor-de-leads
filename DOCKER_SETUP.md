# 🐳 Configuração Docker - Coletor de Leads

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado
- Git

## 🚀 Configuração Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/Vinicius-Almeeida/coletor-de-leads.git
cd projeto-mini-scraper-leads
```

### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 3. Configure as variáveis no arquivo .env:

```env
# Configurações do Banco de Dados PostgreSQL
DB_USER=coletor_user
DB_PASSWORD=sua_senha_segura_aqui
DB_NAME=coletor_leads

# Configurações da API Google Places
GOOGLE_PLACES_API_KEY=sua_chave_api_google_places_aqui

# Configurações do Servidor
PORT=3001
NODE_ENV=development
```

## 🐳 Executando com Docker

### 1. Iniciar o banco de dados PostgreSQL

```bash
docker-compose up -d db
```

### 2. Verificar se o container está rodando

```bash
docker-compose ps
```

### 3. Verificar logs do banco

```bash
docker-compose logs db
```

### 4. Conectar ao banco de dados

```bash
# Via Docker
docker-compose exec db psql -U coletor_user -d coletor_leads

# Via cliente local (se tiver psql instalado)
psql -h localhost -p 5432 -U coletor_user -d coletor_leads
```

## 🛠️ Comandos Úteis

### Gerenciar containers

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reiniciar serviços
docker-compose restart

# Ver logs em tempo real
docker-compose logs -f db
```

### Backup e Restore

```bash
# Backup do banco
docker-compose exec db pg_dump -U coletor_user coletor_leads > backup.sql

# Restore do banco
docker-compose exec -T db psql -U coletor_user coletor_leads < backup.sql
```

## 📊 Configurações do PostgreSQL

### Porta

- **Container**: 5432
- **Host**: 5432
- **URL de conexão**:
  `postgresql://coletor_user:sua_senha@localhost:5432/coletor_leads`

### Volumes

- **Dados**: `postgres_data:/var/lib/postgresql/data`
- **Localização**: Docker volume persistente

### Rede

- **Nome**: `coletor-network`
- **Tipo**: Bridge

## 🔧 Desenvolvimento

### Instalar dependências do backend

```bash
cd backend-js
npm install
```

### Instalar dependências do frontend

```bash
npm install
```

### Executar backend localmente

```bash
cd backend-js
npm start
```

### Executar frontend localmente

```bash
npm start
```

## 🚨 Troubleshooting

### Problema: Porta 5432 já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :5432

# Parar serviço PostgreSQL local (se houver)
sudo service postgresql stop
```

### Problema: Container não inicia

```bash
# Verificar logs
docker-compose logs db

# Verificar se as variáveis de ambiente estão corretas
docker-compose config
```

### Problema: Permissões de volume

```bash
# Ajustar permissões (Linux/Mac)
sudo chown -R 999:999 postgres_data/
```

## 📝 Próximos Passos

1. ✅ Configurar banco de dados PostgreSQL
2. 🔄 Integrar backend com PostgreSQL
3. 🔄 Criar migrations e schemas
4. 🔄 Implementar autenticação
5. 🔄 Configurar Redis para cache
6. 🔄 Implementar filas de processamento

## 🔗 Links Úteis

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)
