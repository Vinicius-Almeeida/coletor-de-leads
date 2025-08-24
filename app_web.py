"""
Coletor Híbrido de Leads - Versão Web
Interface web para busca e coleta de leads
"""

from flask import Flask, render_template, request, jsonify, send_file
import os
import json
import pandas as pd
from datetime import datetime
from api_handler import get_business_data_from_api
from scraper import enrich_data_with_scraping
import threading
import time

app = Flask(__name__)

# Configuração da API
from config import GOOGLE_PLACES_API_KEY
API_KEY = GOOGLE_PLACES_API_KEY

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
    'searches': [],  # Lista de todas as buscas
    'total_leads': 0,
    'segments': {}   # Organização por segmento
}

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard com todos os resultados organizados"""
    return render_template('dashboard.html', data=all_searches)

@app.route('/whatsapp-leads')
def whatsapp_leads():
    """Página com leads que possuem WhatsApp"""
    return render_template('whatsapp_leads.html')

@app.route('/api/dashboard-data')
def get_dashboard_data():
    """Retorna dados do dashboard em formato JSON"""
    return jsonify(all_searches)

@app.route('/api/search', methods=['POST'])
def start_search():
    """Inicia uma nova busca"""
    global search_status
    
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
    
    # Iniciar busca em thread separada
    thread = threading.Thread(target=search_process, args=(nicho, cidade))
    thread.daemon = True
    thread.start()
    
    return jsonify({'message': 'Busca iniciada', 'status': 'running'})

@app.route('/api/status')
def get_status():
    """Retorna o status atual da busca"""
    return jsonify(search_status)

@app.route('/api/stop', methods=['POST'])
def stop_search():
    """Para a busca atual"""
    global search_status
    search_status['running'] = False
    return jsonify({'message': 'Busca interrompida'})

@app.route('/api/download')
def download_results():
    """Download dos resultados em CSV"""
    if not search_status['results']:
        return jsonify({'error': 'Nenhum resultado disponível'}), 404
    
    # Criar DataFrame
    df = pd.DataFrame(search_status['results'])
    
    # Nome do arquivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leads_{timestamp}.csv"
    
    # Salvar CSV
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    
    return send_file(filename, as_attachment=True, download_name=filename)

@app.route('/api/whatsapp-leads')
def get_whatsapp_leads():
    """Retorna apenas leads que possuem WhatsApp"""
    global all_searches
    
    whatsapp_leads = []
    
    for segment in all_searches['segments'].values():
        for company in segment['companies']:
            if company.get('whatsapp') and company['whatsapp'].strip():
                whatsapp_leads.append({
                    'segmento': f"{segment['nicho']} - {segment['cidade']}",
                    'empresa': company.get('nome', ''),
                    'whatsapp': company['whatsapp'],
                    'telefone': company.get('telefone', ''),
                    'email': company.get('email', ''),
                    'site': company.get('site', ''),
                    'endereco': company.get('endereco', ''),
                    'linkedin': company.get('linkedin', ''),
                    'facebook': company.get('facebook', '')
                })
    
    return jsonify({
        'total_whatsapp_leads': len(whatsapp_leads),
        'leads': whatsapp_leads
    })

def search_process(nicho: str, cidade: str):
    """Processo de busca em background"""
    global search_status
    
    start_time = time.time()
    
    try:
        # Fase 1: API Google Places
        search_status['phase'] = 'Fase 1: Buscando na Google Places API...'
        search_status['progress'] = 10
        
        business_data = get_business_data_from_api(API_KEY, nicho, cidade)
        
        if not business_data:
            search_status['phase'] = 'Nenhum resultado encontrado'
            search_status['running'] = False
            return
        
        search_status['total'] = len(business_data)
        search_status['found'] = len(business_data)
        search_status['progress'] = 50
        
        # Fase 2: Scraping
        search_status['phase'] = 'Fase 2: Enriquecendo dados com scraping...'
        search_status['progress'] = 60
        
        enriched_data = []
        for i, business in enumerate(business_data):
            if not search_status['running']:
                break
                
            search_status['current_item'] = f"Processando: {business.get('nome', 'Empresa')}"
            search_status['progress'] = 60 + (i / len(business_data)) * 30
            
            # Enriquecer dados
            enriched = enrich_data_with_scraping(business)
            enriched_data.append(enriched)
            
            # Atualizar tempo decorrido
            search_status['elapsed_time'] = time.time() - start_time
        
        search_status['results'] = enriched_data
        search_status['phase'] = 'Busca concluída!'
        search_status['progress'] = 100
        search_status['running'] = False
        
        # Salvar resultados no armazenamento global
        save_search_results(nicho, cidade, enriched_data)
        
    except Exception as e:
        search_status['phase'] = f'Erro: {str(e)}'
        search_status['running'] = False

def save_search_results(nicho: str, cidade: str, results: list):
    """Salva os resultados da busca no armazenamento global"""
    global all_searches
    
    # Criar entrada da busca
    search_entry = {
        'id': len(all_searches['searches']) + 1,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'nicho': nicho,
        'cidade': cidade,
        'total_results': len(results),
        'results': results
    }
    
    # Adicionar à lista de buscas
    all_searches['searches'].append(search_entry)
    
    # Atualizar total de leads
    all_searches['total_leads'] += len(results)
    
    # Organizar por segmento
    segment_key = f"{nicho} - {cidade}"
    if segment_key not in all_searches['segments']:
        all_searches['segments'][segment_key] = {
            'nicho': nicho,
            'cidade': cidade,
            'total_leads': 0,
            'searches': [],
            'companies': []
        }
    
    all_searches['segments'][segment_key]['total_leads'] += len(results)
    all_searches['segments'][segment_key]['searches'].append(search_entry['id'])
    all_searches['segments'][segment_key]['companies'].extend(results)

# Criar diretório de templates se não existir
os.makedirs('templates', exist_ok=True)

# Template HTML
html_template = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coletor Híbrido de Leads</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .nav-links {
            margin-top: 20px;
        }
        
        .nav-link {
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 25px;
            transition: all 0.3s;
            background: rgba(255,255,255,0.1);
        }
        
        .nav-link:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }
        
        .nav-link.active {
            background: rgba(255,255,255,0.3);
            font-weight: bold;
        }
        
        .content {
            padding: 30px;
        }
        
        .search-form {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
            margin-right: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-success {
            background: #28a745;
        }
        
        .status-panel {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            display: none;
        }
        
        .status-panel.active {
            display: block;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 15px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
            width: 0%;
        }
        
        .status-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .status-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .status-item h4 {
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .results-panel {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        
        .results-panel.active {
            display: block;
        }
        
        .result-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
        }
        
        .result-item h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .result-item p {
            margin: 5px 0;
            color: #666;
        }
        
        .result-item strong {
            color: #333;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Coletor Híbrido de Leads</h1>
            <p>Sistema inteligente de coleta de leads empresariais</p>
                         <div class="nav-links">
                 <a href="/" class="nav-link active">🔍 Nova Busca</a>
                 <a href="/dashboard" class="nav-link">📊 Dashboard</a>
                 <a href="/whatsapp-leads" class="nav-link">📞 WhatsApp Leads</a>
             </div>
        </div>
        
        <div class="content">
            <!-- Formulário de Busca -->
            <div class="search-form">
                <h2>🔍 Nova Busca</h2>
                <form id="searchForm">
                    <div class="form-group">
                        <label for="nicho">Nicho de Mercado:</label>
                        <input type="text" id="nicho" name="nicho" placeholder="Ex: rolamentos, consultoria, marketing" required>
                    </div>
                    <div class="form-group">
                        <label for="cidade">Cidade:</label>
                        <input type="text" id="cidade" name="cidade" placeholder="Ex: Itajaí, São Paulo, Rio de Janeiro" required>
                    </div>
                    <button type="submit" class="btn" id="searchBtn">🔍 Iniciar Busca</button>
                    <button type="button" class="btn btn-secondary" id="stopBtn" style="display: none;">⏹️ Parar Busca</button>
                </form>
            </div>
            
            <!-- Painel de Status -->
            <div class="status-panel" id="statusPanel">
                <h3>📊 Status da Busca</h3>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="status-info">
                    <div class="status-item">
                        <h4>Fase Atual</h4>
                        <p id="currentPhase">-</p>
                    </div>
                    <div class="status-item">
                        <h4>Progresso</h4>
                        <p id="progressText">0%</p>
                    </div>
                    <div class="status-item">
                        <h4>Encontrados</h4>
                        <p id="foundCount">0</p>
                    </div>
                    <div class="status-item">
                        <h4>Tempo</h4>
                        <p id="elapsedTime">0s</p>
                    </div>
                </div>
                <div id="currentItem" style="margin-top: 15px; text-align: center; font-style: italic; color: #666;"></div>
            </div>
            
            <!-- Painel de Resultados -->
            <div class="results-panel" id="resultsPanel">
                <h3>📋 Resultados da Busca</h3>
                <div id="resultsList"></div>
                <button class="btn btn-success" id="downloadBtn">📥 Download CSV</button>
            </div>
        </div>
    </div>

    <script>
        let statusInterval;
        
        // Formulário de busca
        document.getElementById('searchForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nicho = document.getElementById('nicho').value;
            const cidade = document.getElementById('cidade').value;
            
            // Mostrar painel de status
            document.getElementById('statusPanel').classList.add('active');
            document.getElementById('resultsPanel').classList.remove('active');
            
            // Desabilitar botão de busca
            document.getElementById('searchBtn').disabled = true;
            document.getElementById('stopBtn').style.display = 'inline-block';
            
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nicho, cidade })
                });
                
                if (response.ok) {
                    // Iniciar polling de status
                    startStatusPolling();
                } else {
                    const error = await response.json();
                    showError(error.error);
                }
            } catch (error) {
                showError('Erro ao iniciar busca: ' + error.message);
            }
        });
        
        // Botão de parar
        document.getElementById('stopBtn').addEventListener('click', async function() {
            try {
                await fetch('/api/stop', { method: 'POST' });
                stopStatusPolling();
                resetUI();
            } catch (error) {
                showError('Erro ao parar busca: ' + error.message);
            }
        });
        
        // Botão de download
        document.getElementById('downloadBtn').addEventListener('click', function() {
            window.location.href = '/api/download';
        });
        
        function startStatusPolling() {
            statusInterval = setInterval(async () => {
                try {
                    const response = await fetch('/api/status');
                    const status = await response.json();
                    
                    updateStatus(status);
                    
                    if (!status.running) {
                        stopStatusPolling();
                        if (status.results && status.results.length > 0) {
                            showResults(status.results);
                        }
                        resetUI();
                    }
                } catch (error) {
                    console.error('Erro ao buscar status:', error);
                }
            }, 1000);
        }
        
        function stopStatusPolling() {
            if (statusInterval) {
                clearInterval(statusInterval);
                statusInterval = null;
            }
        }
        
        function updateStatus(status) {
            document.getElementById('currentPhase').textContent = status.phase;
            document.getElementById('progressText').textContent = status.progress + '%';
            document.getElementById('foundCount').textContent = status.found;
            document.getElementById('elapsedTime').textContent = Math.round(status.elapsed_time) + 's';
            document.getElementById('currentItem').textContent = status.current_item || '';
            
            // Atualizar barra de progresso
            document.getElementById('progressFill').style.width = status.progress + '%';
        }
        
        function showResults(results) {
            const resultsList = document.getElementById('resultsList');
            resultsList.innerHTML = '';
            
            results.forEach((result, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <h3>${index + 1}. ${result.nome || 'Nome não disponível'}</h3>
                    <p><strong>📞 Telefone:</strong> ${result.telefone || 'Não informado'}</p>
                    <p><strong>📧 Email:</strong> ${result.email || 'Não encontrado'}</p>
                    <p><strong>🌐 Website:</strong> ${result.site || 'Não informado'}</p>
                    <p><strong>📍 Endereço:</strong> ${result.endereco || 'Não informado'}</p>
                                         <p><strong>💼 LinkedIn:</strong> ${result.linkedin || 'Não encontrado'}</p>
                     <p><strong>📱 Facebook:</strong> ${result.facebook || 'Não encontrado'}</p>
                     <p><strong>📞 WhatsApp:</strong> ${result.whatsapp || 'Não encontrado'}</p>
                `;
                resultsList.appendChild(resultItem);
            });
            
            document.getElementById('resultsPanel').classList.add('active');
        }
        
        function resetUI() {
            document.getElementById('searchBtn').disabled = false;
            document.getElementById('stopBtn').style.display = 'none';
        }
        
        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            document.querySelector('.content').insertBefore(errorDiv, document.querySelector('.search-form'));
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
        
        function showSuccess(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.textContent = message;
            document.querySelector('.content').insertBefore(successDiv, document.querySelector('.search-form'));
            
            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        }
    </script>
</body>
</html>
"""

# Criar arquivo de template
with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

if __name__ == '__main__':
    print("🌐 Iniciando servidor web...")
    print("📱 Acesse: http://localhost:5000")
    print("💡 Use Ctrl+C para parar o servidor")
    app.run(debug=True, host='0.0.0.0', port=5000)
