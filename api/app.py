"""
API para Vercel Functions
"""

import sys
import os
sys.path.append('..')

# Importar o app do backend
from backend.app import app

# Para o Vercel Functions
def handler(request, context):
    return app(request, context)

# Para compatibilidade com outros servidores
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
