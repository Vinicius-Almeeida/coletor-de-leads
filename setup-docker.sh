#!/bin/bash

# 🐳 Script de Setup Docker - Coletor de Leads
# Este script configura o ambiente de desenvolvimento

echo "🚀 Configurando ambiente Docker para Coletor de Leads..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ Arquivo .env criado a partir do env.example"
        echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!"
        echo "   - Configure DB_PASSWORD com uma senha segura"
        echo "   - Configure GOOGLE_PLACES_API_KEY com sua chave da API"
        read -p "Pressione Enter após configurar o .env..."
    else
        echo "❌ Arquivo env.example não encontrado"
        exit 1
    fi
else
    echo "✅ Arquivo .env já existe"
fi

# Verificar se as variáveis essenciais estão configuradas
if grep -q "sua_senha_segura_aqui" .env; then
    echo "⚠️  ATENÇÃO: Você ainda não configurou a senha do banco de dados no .env"
    echo "   Por favor, edite o arquivo .env e configure DB_PASSWORD"
    read -p "Pressione Enter após configurar a senha..."
fi

if grep -q "sua_chave_api_google_places_aqui" .env; then
    echo "⚠️  ATENÇÃO: Você ainda não configurou a chave da API Google Places no .env"
    echo "   Por favor, edite o arquivo .env e configure GOOGLE_PLACES_API_KEY"
    read -p "Pressione Enter após configurar a chave da API..."
fi

# Iniciar o banco de dados
echo "🐳 Iniciando PostgreSQL..."
docker-compose up -d db

# Aguardar o banco inicializar
echo "⏳ Aguardando PostgreSQL inicializar..."
sleep 10

# Verificar se o container está rodando
if docker-compose ps | grep -q "Up"; then
    echo "✅ PostgreSQL iniciado com sucesso!"
    echo ""
    echo "📊 Informações de conexão:"
    echo "   Host: localhost"
    echo "   Porta: 5432"
    echo "   Banco: coletor_leads"
    echo "   Usuário: coletor_user"
    echo ""
    echo "🔗 Para conectar ao banco:"
    echo "   docker-compose exec db psql -U coletor_user -d coletor_leads"
    echo ""
    echo "📝 Para ver logs:"
    echo "   docker-compose logs -f db"
    echo ""
    echo "🛑 Para parar:"
    echo "   docker-compose down"
    echo ""
    echo "🎉 Ambiente configurado com sucesso!"
else
    echo "❌ Erro ao iniciar PostgreSQL"
    echo "Verifique os logs com: docker-compose logs db"
    exit 1
fi
