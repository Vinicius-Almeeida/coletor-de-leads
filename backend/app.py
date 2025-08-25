"""
Backend Python para o Coletor de Leads
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime
import pandas as pd
import threading
import time
import requests
from dotenv import load_dotenv
import sys
sys.path.append('..')
from scraper import enrich_data_with_scraping

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)
CORS(app, origins=['*'])  # Em produção, especifique o domínio do frontend

# Configuração da API do Google Places
GOOGLE_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')
if not GOOGLE_API_KEY:
    print("⚠️ AVISO: GOOGLE_PLACES_API_KEY não encontrada no arquivo .env")
    print("📝 Crie um arquivo .env na raiz do projeto com:")
    print("GOOGLE_PLACES_API_KEY=sua_chave_aqui")

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

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde"""
    return jsonify({
        'status': 'healthy',
        'message': 'Coletor de Leads funcionando!',
        'timestamp': datetime.now().isoformat()
    })

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
        
        # Executar busca real
        thread = threading.Thread(target=real_search, args=(nicho, cidade))
        thread.daemon = True
        thread.start()
        
        return jsonify({'message': 'Busca iniciada', 'status': 'running'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Retorna o status atual da busca"""
    return jsonify(search_status)

@app.route('/api/stop', methods=['POST'])
def stop_search():
    """Para a busca atual"""
    global search_status
    
    search_status['running'] = False
    search_status['phase'] = 'Busca interrompida'
    
    return jsonify({'message': 'Busca interrompida'})

@app.route('/api/download', methods=['GET'])
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
        
        # Retornar arquivo
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """Retorna dados do dashboard em formato JSON"""
    global all_searches
    return jsonify(all_searches)

@app.route('/api/whatsapp-leads', methods=['GET'])
def get_whatsapp_leads():
    """Retorna apenas leads que possuem WhatsApp"""
    global search_status
    
    whatsapp_leads = [lead for lead in search_status['results'] if lead.get('whatsapp')]
    
    return jsonify({
        'total_whatsapp_leads': len(whatsapp_leads),
        'leads': whatsapp_leads
    })

@app.route('/api/download-whatsapp-leads', methods=['GET'])
def download_whatsapp_leads():
    """Download dos leads com WhatsApp em Excel"""
    try:
        global search_status
        
        # Filtrar apenas leads com WhatsApp
        whatsapp_leads = [lead for lead in search_status['results'] if lead.get('whatsapp')]
        
        if not whatsapp_leads:
            return jsonify({'error': 'Nenhum lead com WhatsApp encontrado'}), 400
        
        # Criar DataFrame
        df = pd.DataFrame(whatsapp_leads)
        
        # Renomear colunas para português
        df = df.rename(columns={
            'nome': 'Empresa',
            'telefone': 'Telefone',
            'email': 'Email',
            'site': 'Website',
            'endereco': 'Endereço',
            'whatsapp': 'WhatsApp',
            'linkedin': 'LinkedIn',
            'facebook': 'Facebook'
        })
        
        # Gerar nome do arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'whatsapp_leads_{timestamp}.xlsx'
        
        # Salvar como Excel
        df.to_excel(filename, index=False, engine='openpyxl')
        
        # Retornar arquivo
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def real_search(nicho, cidade):
    """Executa busca real usando Google Places API e scraping"""
    global search_status, all_searches
    
    try:
        if not GOOGLE_API_KEY:
            search_status['phase'] = 'Erro: Chave da API do Google não configurada'
            search_status['running'] = False
            return
        
        search_status['phase'] = 'Fase 1: Buscando empresas via Google Places API'
        search_status['progress'] = 10
        
        # Buscar empresas via Google Places API
        businesses = search_google_places(nicho, cidade)
        
        if not businesses:
            search_status['phase'] = 'Nenhuma empresa encontrada'
            search_status['running'] = False
            return
        
        search_status['total'] = len(businesses)
        search_status['progress'] = 30
        search_status['phase'] = f'Fase 2: Enriquecendo dados de {len(businesses)} empresas'
        
        # Enriquecer dados com scraping
        enriched_results = []
        for i, business in enumerate(businesses):
            if not search_status['running']:
                break
            
            search_status['current_item'] = business.get('name', 'Empresa')
            search_status['progress'] = 30 + (i / len(businesses)) * 60
            
            # Enriquecer com scraping
            enriched_business = enrich_data_with_scraping(business)
            enriched_results.append(enriched_business)
            
            search_status['found'] = len(enriched_results)
            search_status['elapsed_time'] = time.time()
            
            # Pequena pausa para não sobrecarregar
            time.sleep(1)
        
        # Atualizar resultados
        search_status['results'] = enriched_results
        search_status['progress'] = 100
        search_status['phase'] = 'Busca concluída com sucesso!'
        
        # Atualizar estatísticas globais
        update_global_statistics(nicho, enriched_results)
        
    except Exception as e:
        search_status['phase'] = f'Erro na busca: {str(e)}'
        print(f"❌ Erro na busca real: {e}")
    finally:
        search_status['running'] = False


def search_google_places(nicho, cidade):
    """Busca empresas usando Google Places API (New) com múltiplas buscas"""
    try:
        all_businesses = []
        seen_names = set()  # Para evitar duplicatas
        
        # Lista de variações de busca para encontrar mais empresas
        search_variations = [
            f"{nicho} {cidade}",
            f"{nicho} em {cidade}",
            f"distribuidora {nicho} {cidade}",
            f"comercio {nicho} {cidade}",
            f"loja {nicho} {cidade}",
            f"empresa {nicho} {cidade}"
        ]
        
        for i, query in enumerate(search_variations):
            print(f"🔍 Busca {i+1}/{len(search_variations)}: {query}")
            
            # URL da Places API (New)
            url = "https://places.googleapis.com/v1/places:searchText"
            
            headers = {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_API_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.types'
            }
            
            payload = {
                'textQuery': query,
                'languageCode': 'pt-BR',
                'regionCode': 'BR',
                'maxResultCount': 20  # Máximo permitido por busca
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'places' not in data:
                print(f"⚠️ Nenhum resultado para: {query}")
                continue
            
            # Processar resultados
            for place in data.get('places', []):
                display_name = place.get('displayName', {})
                business_name = display_name.get('text', '')
                
                # Evitar duplicatas
                if business_name.lower() in seen_names:
                    continue
                
                seen_names.add(business_name.lower())
                
                business = {
                    'nome': business_name,
                    'telefone': place.get('internationalPhoneNumber', ''),
                    'site': place.get('websiteUri', ''),
                    'endereco': place.get('formattedAddress', ''),
                    'email': '',
                    'linkedin': '',
                    'facebook': '',
                    'whatsapp': ''
                }
                all_businesses.append(business)
            
            # Pequena pausa entre buscas para não sobrecarregar a API
            if i < len(search_variations) - 1:
                time.sleep(1)
        
        print(f"✅ Encontradas {len(all_businesses)} empresas únicas via Places API (New)")
        return all_businesses
        
    except Exception as e:
        print(f"❌ Erro na busca Places API (New): {e}")
        return []


def update_global_statistics(nicho, results):
    """Atualiza estatísticas globais"""
    global all_searches
    
    # Adicionar busca atual
    search_info = {
        'nicho': nicho,
        'timestamp': datetime.now().isoformat(),
        'total_leads': len(results),
        'whatsapp_leads': len([r for r in results if r.get('whatsapp')])
    }
    
    all_searches['searches'].append(search_info)
    all_searches['total_leads'] += len(results)
    
    # Atualizar segmentos
    if nicho not in all_searches['segments']:
        all_searches['segments'][nicho] = 0
    all_searches['segments'][nicho] += len(results)

if __name__ == '__main__':
    print("🚀 Iniciando servidor backend...")
    port = int(os.environ.get('PORT', 5000))
    print(f"📱 Backend rodando em: http://localhost:{port}")
    app.run(debug=False, host='0.0.0.0', port=port)
