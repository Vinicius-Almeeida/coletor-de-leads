"""
Configurações do sistema
Carrega variáveis de ambiente de forma segura
"""

import os
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

# Configurações da API
GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')

# Validação da chave da API
if not GOOGLE_PLACES_API_KEY:
    print("⚠️  AVISO: Chave da API não configurada!")
    print("💡 Crie um arquivo .env na raiz do projeto com:")
    print("   GOOGLE_PLACES_API_KEY=sua_chave_aqui")
    print("🔒 A chave da API não será enviada para o GitHub")
