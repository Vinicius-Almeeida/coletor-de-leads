"""
Coletor Híbrido de Leads - Versão Web Simplificada para Vercel
"""

from flask import Flask, render_template, request, jsonify, send_file
import os
import json
import pandas as pd
from datetime import datetime
import threading
import time

app = Flask(__name__)

# Configuração da API
try:
    from config import GOOGLE_PLACES_API_KEY
    API_KEY = GOOGLE_PLACES_API_KEY
except ImportError:
    API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')

# Variáveis globais para status
search_status = {
    'running': False,
    'phase': '',
    'progress': 0,
    'total': 0,
    'found': 0,
    'current_item': '',
    'elapsed_time': 0,
    'results': []
}

# Armazenamento de todas as buscas realizadas
all_searches = {
    'searches': [],
    'total_leads': 0,
    'segments': {}
}

@app.route('/')
def index():
    """Página principal"""
    try:
        return render_template('index.html')
    except Exception as e:
        return f"Erro ao carregar página: {str(e)}", 500

@app.route('/dashboard')
def dashboard():
    """Dashboard com todos os resultados organizados"""
    try:
        return render_template('dashboard.html', data=all_searches)
    except Exception as e:
        return f"Erro ao carregar dashboard: {str(e)}", 500

@app.route('/whatsapp-leads')
def whatsapp_leads():
    """Página com leads que possuem WhatsApp"""
    try:
        return render_template('whatsapp_leads.html')
    except Exception as e:
        return f"Erro ao carregar página WhatsApp: {str(e)}", 500

@app.route('/api/dashboard-data')
def get_dashboard_data():
    """Retorna dados do dashboard em formato JSON"""
    try:
        return jsonify(all_searches)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def start_search():
    """Inicia uma nova busca"""
    global search_status
    
    try:
        data = request.get_json()
        nicho = data.get('nicho', '')
        cidade = data.get('cidade', '')
        
        if not nicho or not cidade:
            return jsonify({'error': 'Nicho e cidade são obrigatórios'}), 400
        
        # Reset status
        search_status = {
            'running': True,
            'phase': 'Iniciando busca...',
            'progress': 0,
            'total': 0,
            'found': 0,
            'current_item': '',
            'elapsed_time': 0,
            'results': []
        }
        
        # Simular busca (para teste)
        thread = threading.Thread(target=simulate_search, args=(nicho, cidade))
        thread.daemon = True
        thread.start()
        
        return jsonify({'message': 'Busca iniciada', 'status': 'running'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status')
def get_status():
    """Retorna o status atual da busca"""
    try:
        return jsonify(search_status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stop', methods=['POST'])
def stop_search():
    """Para a busca atual"""
    global search_status
    
    try:
        search_status['running'] = False
        search_status['phase'] = 'Busca interrompida'
        return jsonify({'message': 'Busca interrompida'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download')
def download_results():
    """Download dos resultados em Excel"""
    try:
        if not search_status['results']:
            return jsonify({'error': 'Nenhum resultado para download'}), 400
        
        # Criar DataFrame
        df = pd.DataFrame(search_status['results'])
        
        # Gerar nome do arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'leads_{timestamp}.xlsx'
        
        # Salvar como Excel
        df.to_excel(filename, index=False, engine='openpyxl')
        
        return send_file(filename, as_attachment=True, download_name=filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def simulate_search(nicho, cidade):
    """Simula uma busca para teste"""
    global search_status
    
    try:
        # Simular progresso
        for i in range(5):
            if not search_status['running']:
                break
            
            search_status['phase'] = f'Fase {i+1}/5: Buscando {nicho} em {cidade}'
            search_status['progress'] = (i + 1) * 20
            search_status['current_item'] = f'Item {i+1}'
            search_status['found'] = i + 1
            search_status['elapsed_time'] = (i + 1) * 2
            
            # Adicionar resultado simulado
            search_status['results'].append({
                'nome': f'Empresa {i+1}',
                'telefone': f'(11) 99999-{i+1:04d}',
                'email': f'contato@empresa{i+1}.com',
                'site': f'https://empresa{i+1}.com',
                'endereco': f'Rua {i+1}, {cidade}',
                'linkedin': f'https://linkedin.com/company/empresa{i+1}',
                'facebook': f'https://facebook.com/empresa{i+1}',
                'whatsapp': f'1199999{i+1:04d}'
            })
            
            time.sleep(2)
        
        search_status['running'] = False
        search_status['phase'] = 'Busca concluída'
        search_status['progress'] = 100
        
    except Exception as e:
        search_status['running'] = False
        search_status['phase'] = f'Erro: {str(e)}'

@app.route('/health')
def health_check():
    """Endpoint de verificação de saúde"""
    return jsonify({
        'status': 'healthy',
        'message': 'Coletor de Leads funcionando!',
        'api_key_configured': bool(API_KEY)
    })

if __name__ == '__main__':
    print("🌐 Iniciando servidor web...")
    print("📱 Acesse: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

# Para Vercel
app.debug = False
