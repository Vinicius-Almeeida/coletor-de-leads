# 🐳 Script de Setup Docker - Coletor de Leads (Windows PowerShell)
# Este script configura o ambiente de desenvolvimento

Write-Host "🚀 Configurando ambiente Docker para Coletor de Leads..." -ForegroundColor Green

# Verificar se Docker está instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está instalado. Por favor, instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Docker Compose está instalado
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Arquivo .env criado a partir do env.example" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!" -ForegroundColor Yellow
        Write-Host "   - Configure DB_PASSWORD com uma senha segura" -ForegroundColor Yellow
        Write-Host "   - Configure GOOGLE_PLACES_API_KEY com sua chave da API" -ForegroundColor Yellow
        Read-Host "Pressione Enter após configurar o .env"
    } else {
        Write-Host "❌ Arquivo env.example não encontrado" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Arquivo .env já existe" -ForegroundColor Green
}

# Verificar se as variáveis essenciais estão configuradas
$envContent = Get-Content ".env" -Raw
if ($envContent -match "sua_senha_segura_aqui") {
    Write-Host "⚠️  ATENÇÃO: Você ainda não configurou a senha do banco de dados no .env" -ForegroundColor Yellow
    Write-Host "   Por favor, edite o arquivo .env e configure DB_PASSWORD" -ForegroundColor Yellow
    Read-Host "Pressione Enter após configurar a senha"
}

if ($envContent -match "sua_chave_api_google_places_aqui") {
    Write-Host "⚠️  ATENÇÃO: Você ainda não configurou a chave da API Google Places no .env" -ForegroundColor Yellow
    Write-Host "   Por favor, edite o arquivo .env e configure GOOGLE_PLACES_API_KEY" -ForegroundColor Yellow
    Read-Host "Pressione Enter após configurar a chave da API"
}

# Iniciar o banco de dados
Write-Host "🐳 Iniciando PostgreSQL..." -ForegroundColor Blue
docker-compose up -d db

# Aguardar o banco inicializar
Write-Host "⏳ Aguardando PostgreSQL inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar se o container está rodando
$containerStatus = docker-compose ps
if ($containerStatus -match "Up") {
    Write-Host "✅ PostgreSQL iniciado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Informações de conexão:" -ForegroundColor Cyan
    Write-Host "   Host: localhost" -ForegroundColor White
    Write-Host "   Porta: 5432" -ForegroundColor White
    Write-Host "   Banco: coletor_leads" -ForegroundColor White
    Write-Host "   Usuário: coletor_user" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Para conectar ao banco:" -ForegroundColor Cyan
    Write-Host "   docker-compose exec db psql -U coletor_user -d coletor_leads" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Para ver logs:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f db" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Para parar:" -ForegroundColor Cyan
    Write-Host "   docker-compose down" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Ambiente configurado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao iniciar PostgreSQL" -ForegroundColor Red
    Write-Host "Verifique os logs com: docker-compose logs db" -ForegroundColor Yellow
    exit 1
}
