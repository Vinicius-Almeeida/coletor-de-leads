"""
Função de teste simples para Netlify
"""

import json

def handler(event, context):
    """Função de teste"""
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
    
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': 'Teste funcionando!',
            'method': event['httpMethod'],
            'path': event.get('path', ''),
            'timestamp': '2025-08-24'
        })
    }
