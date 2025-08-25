"""
Módulo responsável pelo scraping ético de sites de empresas.
Extrai informações adicionais de contato dos sites obtidos via API.
"""

import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional
import re
from urllib.parse import urljoin, urlparse


def enrich_data_with_scraping(business_data: Dict[str, str]) -> Dict[str, str]:
    """
    Enriquece os dados da empresa com informações extraídas do site.
    
    Args:
        business_data (Dict[str, str]): Dicionário com dados da empresa contendo:
            - nome: Nome da empresa
            - telefone: Telefone da empresa
            - site: URL do site da empresa
            - endereco: Endereço da empresa
    
    Returns:
        Dict[str, str]: Dicionário enriquecido com campos adicionais:
            - email: E-mail encontrado no site
            - linkedin: LinkedIn encontrado no site
            - facebook: Facebook encontrado no site
            - whatsapp: WhatsApp encontrado no site
    """
    
    site_url = business_data.get('site', '')
    
    if not site_url or not validate_url(site_url):
        print(f"⚠️ {business_data.get('nome', 'Empresa')}: Sem site disponível")
        return _add_empty_fields(business_data)
    
    print(f"🔍 Fazendo scraping do site: {site_url}")
    
    try:
        # Fazer requisição HTTP
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        response = requests.get(site_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Verificar se a resposta é HTML
        content_type = response.headers.get('content-type', '').lower()
        if 'text/html' not in content_type:
            print(f"⚠️ {business_data.get('nome', 'Empresa')}: Resposta não é HTML")
            return _add_empty_fields(business_data)
        
        # Parsear HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrair informações
        email = _extract_email(soup, site_url)
        linkedin = _extract_linkedin(soup, site_url)
        facebook = _extract_facebook(soup, site_url)
        whatsapp = _extract_whatsapp(soup, site_url)
        
        # Adicionar campos ao dicionário
        enriched_data = business_data.copy()
        enriched_data['email'] = email
        enriched_data['linkedin'] = linkedin
        enriched_data['facebook'] = facebook
        enriched_data['whatsapp'] = whatsapp
        
        # Log dos resultados
        found_items = []
        if email:
            found_items.append("e-mail")
        if linkedin:
            found_items.append("LinkedIn")
        if facebook:
            found_items.append("Facebook")
        if whatsapp:
            found_items.append("WhatsApp")
        
        if found_items:
            print(f"✅ {business_data.get('nome', 'Empresa')}: Encontrados {', '.join(found_items)}")
        else:
            print(f"ℹ️ {business_data.get('nome', 'Empresa')}: Nenhuma informação adicional encontrada")
        
        return enriched_data
        
    except requests.exceptions.Timeout:
        print(f"⏰ {business_data.get('nome', 'Empresa')}: Timeout ao acessar o site")
        return _add_empty_fields(business_data)
    
    except requests.exceptions.ConnectionError:
        print(f"🔌 {business_data.get('nome', 'Empresa')}: Erro de conexão com o site")
        return _add_empty_fields(business_data)
    
    except requests.exceptions.HTTPError as e:
        print(f"❌ {business_data.get('nome', 'Empresa')}: Erro HTTP {e.response.status_code}")
        return _add_empty_fields(business_data)
        
    except Exception as e:
        print(f"❌ {business_data.get('nome', 'Empresa')}: Erro inesperado: {str(e)}")
        return _add_empty_fields(business_data)


def _extract_email(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai e-mail do site.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup do site
        base_url (str): URL base do site
    
    Returns:
        str: E-mail encontrado ou string vazia
    """
    
    # Buscar em links mailto:
    mailto_links = soup.find_all('a', href=re.compile(r'^mailto:', re.IGNORECASE))
    for link in mailto_links:
        href = link.get('href', '')
        email = href.replace('mailto:', '').split('?')[0]
        if '@' in email and '.' in email:
            return email
    
    # Buscar padrões de e-mail no texto
    page_text = soup.get_text()
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_matches = re.findall(email_pattern, page_text)
    
    if email_matches:
        return email_matches[0]
    
    return ""


def _extract_linkedin(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai link do LinkedIn do site.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup do site
        base_url (str): URL base do site
    
    Returns:
        str: Link do LinkedIn encontrado ou string vazia
    """
    
    # Buscar links do LinkedIn
    linkedin_links = soup.find_all('a', href=re.compile(r'linkedin\.com/company/', re.IGNORECASE))
    for link in linkedin_links:
        href = link.get('href', '')
        if href.startswith('http'):
            return href
        else:
            return urljoin(base_url, href)
    
    return ""


def _extract_facebook(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai link do Facebook do site.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup do site
        base_url (str): URL base do site
    
    Returns:
        str: Link do Facebook encontrado ou string vazia
    """
    
    # Buscar links do Facebook
    facebook_links = soup.find_all('a', href=re.compile(r'facebook\.com/', re.IGNORECASE))
    for link in facebook_links:
        href = link.get('href', '')
        if href.startswith('http'):
            return href
    else:
            return urljoin(base_url, href)
    
    return ""


def _extract_whatsapp(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai número de WhatsApp do site.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup do site
        base_url (str): URL base do site
    
    Returns:
        str: Número de WhatsApp encontrado ou string vazia
    """
    
    # Buscar links do WhatsApp
    whatsapp_links = soup.find_all('a', href=re.compile(r'(wa\.me|api\.whatsapp\.com/send|whatsapp://)', re.IGNORECASE))
    for link in whatsapp_links:
        href = link.get('href', '')
        # Extrair número do link
        if 'wa.me/' in href:
            number = href.split('wa.me/')[1].split('?')[0]
            if number.isdigit():
                return number
        elif 'api.whatsapp.com/send?phone=' in href:
            number = href.split('phone=')[1].split('&')[0]
            if number.isdigit():
                return number
    
    # Buscar números de telefone que possam ser WhatsApp
    page_text = soup.get_text()
    phone_matches = re.findall(r'(\d{2,3}[-\s]?\d{4,5}[-\s]?\d{4})', page_text)
    
    for phone in phone_matches:
        # Limpar o número
        clean_number = re.sub(r'[^\d]', '', phone)
        if len(clean_number) >= 10:
            # Verificar se há indicação de WhatsApp próximo ao número
            phone_index = page_text.find(phone)
            surrounding_text = page_text[max(0, phone_index-50):phone_index+50].lower()
            
            # Palavras-chave que indicam WhatsApp
            whatsapp_keywords = ['whatsapp', 'whats', 'wa', 'zap', 'zapzap']
            if any(keyword in surrounding_text for keyword in whatsapp_keywords):
                return clean_number
    
    # Buscar em elementos com classes específicas de WhatsApp
    whatsapp_elements = soup.find_all(['div', 'span', 'a'], class_=re.compile(r'whatsapp|wa|zap', re.IGNORECASE))
    for element in whatsapp_elements:
        element_text = element.get_text()
        phone_matches = re.findall(r'(\d{2,3}[-\s]?\d{4,5}[-\s]?\d{4})', element_text)
        if phone_matches:
            clean_number = re.sub(r'[^\d]', '', phone_matches[0])
            if len(clean_number) >= 10:
                return clean_number
    
    return ""


def _add_empty_fields(business_data: Dict[str, str]) -> Dict[str, str]:
    """
    Adiciona campos vazios ao dicionário de dados da empresa.
    
    Args:
        business_data (Dict[str, str]): Dicionário original com dados da empresa
    
    Returns:
        Dict[str, str]: Dicionário com campos adicionais vazios
    """
    
    enriched_data = business_data.copy()
    enriched_data['email'] = ""
    enriched_data['linkedin'] = ""
    enriched_data['facebook'] = ""
    enriched_data['whatsapp'] = ""
    
    return enriched_data


def validate_url(url: str) -> bool:
    """
    Valida se uma URL é válida.
    
    Args:
        url (str): URL para validar
    
    Returns:
        bool: True se a URL for válida, False caso contrário
    """
    
    if not url:
        return False
    
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


if __name__ == "__main__":
    # Teste do módulo
    print("🧪 Testando módulo scraper...")
    
    # Dados de teste
    test_business = {
        'nome': 'Empresa Teste',
        'telefone': '(11) 99999-9999',
        'site': 'https://www.google.com',
        'endereco': 'Rua Teste, 123 - São Paulo, SP'
    }
    
    try:
        print("🔍 Testando scraping...")
        enriched_data = enrich_data_with_scraping(test_business)
        
        print(f"\n📊 Resultados do teste:")
        print(f"Nome: {enriched_data['nome']}")
        print(f"Telefone: {enriched_data['telefone']}")
        print(f"Site: {enriched_data['site']}")
        print(f"Endereço: {enriched_data['endereco']}")
        print(f"E-mail: {enriched_data['email']}")
        print(f"LinkedIn: {enriched_data['linkedin']}")
        print(f"Facebook: {enriched_data['facebook']}")
        print(f"WhatsApp: {enriched_data['whatsapp']}")
        
    except Exception as e:
        print(f"❌ Erro no teste: {e}")
