# Script para deploy automatizado

#!/bin/bash

# deploy.sh - Script para deploy da aplicação

echo "🚀 Iniciando deploy da Lista de Compras..."

# 1. Fazer backup do banco (se necessário)
echo "📦 Fazendo backup do banco..."
docker-compose exec db pg_dump -U user lista_compras > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Baixar últimas mudanças
echo "📥 Baixando código atualizado..."
git pull origin main

# 3. Rebuild da aplicação
echo "🔨 Rebuilding aplicação..."
docker-compose build app

# 4. Parar serviços antigos
echo "⏹️ Parando serviços..."
docker-compose down

# 5. Subir novos serviços
echo "▶️ Subindo serviços atualizados..."
docker-compose up -d

# 6. Aguardar aplicação ficar pronta
echo "⏳ Aguardando aplicação ficar pronta..."
sleep 10

# 7. Verificar se está funcionando
echo "🔍 Verificando saúde da aplicação..."
if curl -f http://localhost:3000/api/listas?deviceId=health-check > /dev/null 2>&1; then
    echo "✅ Deploy realizado com sucesso!"
    echo "🌐 Aplicação disponível em http://localhost:3000"
else
    echo "❌ Erro no deploy. Verificando logs..."
    docker-compose logs app
    exit 1
fi

# 8. Limpar imagens antigas
echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo "🎉 Deploy finalizado!"

# Para usar:
# chmod +x deploy.sh
# ./deploy.sh
