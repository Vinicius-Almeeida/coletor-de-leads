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
            - linkedin: URL do LinkedIn da empresa
            - facebook: URL do Facebook da empresa
    """
    
    # Verificar se há site para fazer scraping
    site_url = business_data.get('site', '').strip()
    if not site_url:
        print(f"⚠️ {business_data.get('nome', 'Empresa')}: Sem site disponível")
        return _add_empty_fields(business_data)
    
    # Normalizar URL
    if not site_url.startswith(('http://', 'https://')):
        site_url = 'https://' + site_url
    
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
    Extrai e-mail do HTML da página.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup com o HTML parseado
        base_url (str): URL base do site
    
    Returns:
        str: E-mail encontrado ou string vazia
    """
    
    # Padrão para e-mails
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    
    # Buscar em links mailto:
    mailto_links = soup.find_all('a', href=re.compile(r'^mailto:', re.IGNORECASE))
    for link in mailto_links:
        href = link.get('href', '')
        if href.startswith('mailto:'):
            email = href[7:]  # Remove 'mailto:'
            if re.match(email_pattern, email):
                return email
    
    # Buscar em texto da página
    page_text = soup.get_text()
    email_matches = re.findall(email_pattern, page_text)
    
    # Filtrar e-mails válidos (excluir e-mails genéricos)
    valid_emails = []
    for email in email_matches:
        email_lower = email.lower()
        # Excluir e-mails genéricos ou de teste
        if not any(excluded in email_lower for excluded in ['example.com', 'test.com', 'noreply', 'no-reply']):
            valid_emails.append(email)
    
    return valid_emails[0] if valid_emails else ""


def _extract_linkedin(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai URL do LinkedIn da empresa.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup com o HTML parseado
        base_url (str): URL base do site
    
    Returns:
        str: URL do LinkedIn encontrada ou string vazia
    """
    
    # Buscar links que contenham linkedin.com/company/
    linkedin_links = soup.find_all('a', href=re.compile(r'linkedin\.com/company/', re.IGNORECASE))
    
    for link in linkedin_links:
        href = link.get('href', '')
        if 'linkedin.com/company/' in href.lower():
            # Normalizar URL
            if href.startswith('/'):
                return urljoin(base_url, href)
            elif href.startswith('http'):
                return href
            else:
                return urljoin(base_url, href)
    
    # Buscar em qualquer link que contenha linkedin
    all_links = soup.find_all('a', href=True)
    for link in all_links:
        href = link.get('href', '').lower()
        if 'linkedin.com' in href and 'company' in href:
            if href.startswith('/'):
                return urljoin(base_url, href)
            elif href.startswith('http'):
                return href
            else:
                return urljoin(base_url, href)
    
    return ""


def _extract_facebook(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai URL do Facebook da empresa.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup com o HTML parseado
        base_url (str): URL base do site
    
    Returns:
        str: URL do Facebook encontrada ou string vazia
    """
    
    # Buscar links que contenham facebook.com
    facebook_links = soup.find_all('a', href=re.compile(r'facebook\.com', re.IGNORECASE))
    
    for link in facebook_links:
        href = link.get('href', '')
        if 'facebook.com' in href.lower():
            # Normalizar URL
            if href.startswith('/'):
                return urljoin(base_url, href)
            elif href.startswith('http'):
                return href
            else:
                return urljoin(base_url, href)
    
    return ""


def _extract_whatsapp(soup: BeautifulSoup, base_url: str) -> str:
    """
    Extrai número de WhatsApp da empresa.
    
    Args:
        soup (BeautifulSoup): Objeto BeautifulSoup com o HTML parseado
        base_url (str): URL base do site
    
    Returns:
        str: Número de WhatsApp encontrado ou string vazia
    """
    
    # Padrões para WhatsApp
    whatsapp_patterns = [
        r'https?://(?:www\.)?wa\.me/(\d+)',  # wa.me links
        r'https?://(?:www\.)?api\.whatsapp\.com/send\?phone=(\d+)',  # api.whatsapp.com links
        r'whatsapp://send\?phone=(\d+)',  # whatsapp:// protocol
        r'(\d{10,14})',  # Números de telefone (10-14 dígitos)
    ]
    
    # Buscar em links
    whatsapp_links = soup.find_all('a', href=True)
    for link in whatsapp_links:
        href = link.get('href', '').lower()
        
        # Verificar se é um link de WhatsApp
        for pattern in whatsapp_patterns[:3]:  # Apenas padrões de URL
            match = re.search(pattern, href, re.IGNORECASE)
            if match:
                phone_number = match.group(1)
                # Limpar o número (remover caracteres especiais)
                clean_number = re.sub(r'[^\d]', '', phone_number)
                if len(clean_number) >= 10:
                    return clean_number
    
    # Buscar em texto da página
    page_text = soup.get_text()
    
    # Buscar números de telefone que possam ser WhatsApp
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
        
    except Exception as e:
        print(f"❌ Erro no teste: {e}")
