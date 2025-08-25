"""
Função principal da Netlify para o Coletor de Leads
"""

import json
import os
import sys
from datetime import datetime
import pandas as pd
import threading
import time

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

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

def handler(event, context):
    """Função principal da Netlify"""
    
    # Configurar CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
    
    # Lidar com preflight requests
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Extrair path e método
    path = event.get('path', '').replace('/.netlify/functions/api', '')
    method = event['httpMethod']
    
    try:
        # Roteamento
        if path == '/health' and method == 'GET':
            return health_check(headers)
        elif path == '/search' and method == 'POST':
            return start_search(event, headers)
        elif path == '/status' and method == 'GET':
            return get_status(headers)
        elif path == '/stop' and method == 'POST':
            return stop_search(headers)
        elif path == '/download' and method == 'GET':
            return download_results(headers)
        elif path == '/dashboard-data' and method == 'GET':
            return get_dashboard_data(headers)
        elif path == '/whatsapp-leads' and method == 'GET':
            return get_whatsapp_leads(headers)
        elif path == '/download-whatsapp-leads' and method == 'GET':
            return download_whatsapp_leads(headers)
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint não encontrado'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def health_check(headers):
    """Endpoint de verificação de saúde"""
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'status': 'healthy',
            'message': 'Coletor de Leads funcionando na Netlify!',
            'api_key_configured': bool(API_KEY)
        })
    }

def start_search(event, headers):
    """Inicia uma nova busca"""
    global search_status
    
    try:
        body = json.loads(event.get('body', '{}'))
        nicho = body.get('nicho', '')
        cidade = body.get('cidade', '')
        
        if not nicho or not cidade:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Nicho e cidade são obrigatórios'})
            }
        
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
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Busca iniciada', 'status': 'running'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def get_status(headers):
    """Retorna o status atual da busca"""
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(search_status)
    }

def stop_search(headers):
    """Para a busca atual"""
    global search_status
    
    search_status['running'] = False
    search_status['phase'] = 'Busca interrompida'
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Busca interrompida'})
    }

def download_results(headers):
    """Download dos resultados em Excel"""
    try:
        if not search_status['results']:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Nenhum resultado para download'})
            }
        
        # Criar DataFrame
        df = pd.DataFrame(search_status['results'])
        
        # Gerar nome do arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'leads_{timestamp}.xlsx'
        
        # Salvar como Excel
        df.to_excel(filename, index=False, engine='openpyxl')
        
        # Ler arquivo
        with open(filename, 'rb') as f:
            file_content = f.read()
        
        # Remover arquivo temporário
        os.remove(filename)
        
        # Retornar arquivo
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': file_content,
            'isBase64Encoded': True
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def get_dashboard_data(headers):
    """Retorna dados do dashboard em formato JSON"""
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(all_searches)
    }

def get_whatsapp_leads(headers):
    """Retorna apenas leads que possuem WhatsApp"""
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
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'total_whatsapp_leads': len(whatsapp_leads),
            'leads': whatsapp_leads
        })
    }

def download_whatsapp_leads(headers):
    """Download dos leads com WhatsApp em Excel"""
    try:
        whatsapp_leads = []
        
        for segment in all_searches['segments'].values():
            for company in segment['companies']:
                if company.get('whatsapp') and company['whatsapp'].strip():
                    whatsapp_leads.append({
                        'Empresa': company.get('nome', ''),
                        'Segmento': f"{segment['nicho']} - {segment['cidade']}",
                        'WhatsApp': company['whatsapp'],
                        'Telefone': company.get('telefone', ''),
                        'Email': company.get('email', ''),
                        'Website': company.get('site', ''),
                        'Endereço': company.get('endereco', ''),
                        'LinkedIn': company.get('linkedin', ''),
                        'Facebook': company.get('facebook', '')
                    })
        
        if not whatsapp_leads:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Nenhum lead com WhatsApp encontrado'})
            }
        
        # Criar DataFrame
        df = pd.DataFrame(whatsapp_leads)
        
        # Nome do arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'whatsapp_leads_{timestamp}.xlsx'
        
        # Salvar como Excel
        df.to_excel(filename, index=False, engine='openpyxl')
        
        # Ler arquivo
        with open(filename, 'rb') as f:
            file_content = f.read()
        
        # Remover arquivo temporário
        os.remove(filename)
        
        # Retornar arquivo
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': file_content,
            'isBase64Encoded': True
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

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
