#!/bin/bash

echo "🚀 Iniciando deploy otimizado..."

# Configurações
BACKEND_DIR="backend-js"
FRONTEND_DIR="."
VERCEL_ORG_ID="${VERCEL_ORG_ID}"
VERCEL_PROJECT_ID_BACKEND="${VERCEL_PROJECT_ID_BACKEND}"
VERCEL_PROJECT_ID_FRONTEND="${VERCEL_PROJECT_ID_FRONTEND}"

# Função para deploy do backend
deploy_backend() {
    echo "🔧 Deployando backend..."
    cd $BACKEND_DIR
    
    # Build otimizado
    npm ci --only=production
    
    # Deploy com configurações otimizadas
    vercel --prod \
        --token $VERCEL_TOKEN \
        --scope $VERCEL_ORG_ID \
        --yes \
        --force
    
    cd ..
}

# Função para deploy do frontend
deploy_frontend() {
    echo "🎨 Deployando frontend..."
    
    # Build otimizado
    npm ci
    npm run build
    
    # Deploy com configurações otimizadas
    vercel --prod \
        --token $VERCEL_TOKEN \
        --scope $VERCEL_ORG_ID \
        --yes \
        --force
}

# Executar deploys em paralelo
echo "⚡ Executando deploys simultâneos..."

# Iniciar deploy do backend em background
deploy_backend &
BACKEND_PID=$!

# Iniciar deploy do frontend em background
deploy_frontend &
FRONTEND_PID=$!

# Aguardar ambos terminarem
wait $BACKEND_PID
BACKEND_EXIT=$?

wait $FRONTEND_PID
FRONTEND_EXIT=$?

# Verificar resultados
if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🔗 Backend: https://seu-backend.vercel.app"
    echo "🔗 Frontend: https://seu-frontend.vercel.app"
else
    echo "❌ Erro no deploy:"
    [ $BACKEND_EXIT -ne 0 ] && echo "   - Backend falhou"
    [ $FRONTEND_EXIT -ne 0 ] && echo "   - Frontend falhou"
    exit 1
fi
