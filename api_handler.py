"""
Módulo responsável pela integração com a Google Places API.
Implementa coleta de dados de empresas de forma legítima e eficiente.
"""

import requests
import time
from typing import List, Dict, Optional
from urllib.parse import quote_plus


def get_business_data_from_api(api_key: str, nicho: str, cidade: str) -> List[Dict[str, str]]:
    """
    Coleta dados de empresas usando a Google Places API em duas fases.
    
    Args:
        api_key (str): Chave da API do Google Places
        nicho (str): Nicho de mercado para busca (ex: "consultoria financeira")
        cidade (str): Cidade para busca (ex: "São Paulo")
    
    Returns:
        List[Dict[str, str]]: Lista de dicionários com dados das empresas encontradas.
        Cada dicionário contém: nome, telefone, site, endereco
    
    Raises:
        ValueError: Se a API key for inválida ou houver erro na API
        requests.RequestException: Se houver erro de conexão
    """
    
    if not api_key or api_key == "SUA_CHAVE_API_AQUI":
        raise ValueError("API key inválida. Configure uma chave válida da Google Places API.")
    
    if not nicho or not cidade:
        raise ValueError("Nicho e cidade são obrigatórios para a busca.")
    
    print(f"🔍 Iniciando busca na Google Places API: {nicho} em {cidade}")
    
    # Fase 1: Text Search - Buscar empresas
    place_ids = _get_place_ids_from_text_search(api_key, nicho, cidade)
    
    if not place_ids:
        print("❌ Nenhuma empresa encontrada na busca inicial.")
        return []
    
    print(f"✅ Fase 1 concluída: {len(place_ids)} empresas encontradas")
    
    # Fase 2: Place Details - Obter detalhes de cada empresa
    business_data = _get_place_details(api_key, place_ids)
    
    print(f"✅ Fase 2 concluída: {len(business_data)} empresas processadas")
    
    return business_data


def _get_place_ids_from_text_search(api_key: str, nicho: str, cidade: str) -> List[str]:
    """
    Realiza busca textual na Google Places API para obter place_ids.
    
    Args:
        api_key (str): Chave da API do Google Places
        nicho (str): Nicho de mercado
        cidade (str): Cidade para busca
    
    Returns:
        List[str]: Lista de place_ids encontrados
    """
    
    # Construir query de busca
    query = f"{nicho} {cidade}"
    encoded_query = quote_plus(query)
    
    # URL da nova Places API (New)
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.id'
    }
    
    data = {
        'textQuery': query,
        'languageCode': 'pt-BR'
    }
    
    try:
        print(f"📡 Fazendo busca textual: '{query}'")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Extrair place_ids dos resultados
        place_ids = []
        for place in data.get('places', []):
            place_id = place.get('id')
            if place_id:
                place_ids.append(place_id)
        
        print(f"📋 Encontrados {len(place_ids)} place_ids")
        return place_ids
        
    except requests.RequestException as e:
        print(f"❌ Erro de conexão na busca textual: {e}")
        raise
    except Exception as e:
        print(f"❌ Erro inesperado na busca textual: {e}")
        raise


def _get_place_details(api_key: str, place_ids: List[str]) -> List[Dict[str, str]]:
    """
    Obtém detalhes de cada empresa usando os place_ids.
    
    Args:
        api_key (str): Chave da API do Google Places
        place_ids (List[str]): Lista de place_ids para buscar detalhes
    
    Returns:
        List[Dict[str, str]]: Lista de dicionários com dados das empresas
    """
    
    business_data = []
    url = "https://places.googleapis.com/v1/places/"
    
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'displayName,formattedAddress,internationalPhoneNumber,websiteUri'
    }
    
    for i, place_id in enumerate(place_ids, 1):
        try:
            print(f"📊 Processando empresa {i}/{len(place_ids)}...")
            
            response = requests.get(f"{url}{place_id}", headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            business_info = {
                'nome': data.get('displayName', {}).get('text', ''),
                'telefone': data.get('internationalPhoneNumber', ''),
                'site': data.get('websiteUri', ''),
                'endereco': data.get('formattedAddress', ''),
                'whatsapp': ''  # Campo WhatsApp vazio por padrão
            }
            
            # Só adicionar se tiver pelo menos nome
            if business_info['nome']:
                business_data.append(business_info)
                print(f"✅ {business_info['nome']}")
            else:
                print(f"⚠️ Empresa sem nome, ignorando...")
            
            # Delay para respeitar rate limits da API
            time.sleep(0.1)
            
        except requests.RequestException as e:
            print(f"❌ Erro de conexão ao buscar detalhes: {e}")
            continue
        except Exception as e:
            print(f"❌ Erro inesperado ao buscar detalhes: {e}")
            continue
    
    return business_data


def validate_api_key(api_key: str) -> bool:
    """
    Valida se a API key está funcionando corretamente.
    
    Args:
        api_key (str): Chave da API para validar
    
    Returns:
        bool: True se a API key for válida, False caso contrário
    """
    
    if not api_key or api_key == "SUA_CHAVE_API_AQUI":
        return False
    
    try:
        # Teste simples com uma busca
        test_data = get_business_data_from_api(api_key, "restaurante", "São Paulo")
        return len(test_data) > 0
    except Exception:
        return False


if __name__ == "__main__":
    # Teste do módulo
    print("🧪 Testando módulo api_handler...")
    
    # Substitua pela sua API key real
    TEST_API_KEY = "SUA_CHAVE_API_AQUI"
    
    try:
        if validate_api_key(TEST_API_KEY):
            print("✅ API key válida!")
            
            # Teste de busca
            results = get_business_data_from_api(TEST_API_KEY, "consultoria", "São Paulo")
            
            print(f"\n📊 Resultados do teste:")
            print(f"Total de empresas encontradas: {len(results)}")
            
            for i, business in enumerate(results[:3], 1):
                print(f"\n{i}. {business['nome']}")
                print(f"   📞 {business['telefone']}")
                print(f"   🌐 {business['site']}")
                print(f"   📍 {business['endereco']}")
        else:
            print("❌ API key inválida ou não configurada")
            print("💡 Configure uma API key válida da Google Places API")
    
    except Exception as e:
        print(f"❌ Erro no teste: {e}")
