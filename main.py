"""
Orquestrador principal do Coletor Híbrido de Leads.
Coordena a coleta de dados via API e enriquecimento via scraping.
"""

import pandas as pd
from typing import List, Dict
import time
import signal
import sys
import threading
from datetime import datetime
import os

# Importar módulos do projeto
from api_handler import get_business_data_from_api, validate_api_key
from scraper import enrich_data_with_scraping


# Configurações
from config import GOOGLE_PLACES_API_KEY
API_KEY = GOOGLE_PLACES_API_KEY
NICHO_BUSCA = "consultoria financeira"  # 📋 Nicho padrão (pode ser alterado no menu)
CIDADE_BUSCA = "São Paulo"  # 🏙️ Cidade padrão (pode ser alterada no menu)

# Variáveis globais para controle
stop_search = False
current_search_thread = None
search_results = []
search_status = {
    'phase': '',
    'progress': 0,
    'total': 0,
    'found': 0,
    'current_item': '',
    'start_time': None,
    'elapsed_time': 0
}


def signal_handler(signum, frame):
    """Manipulador de sinal para interromper a busca"""
    global stop_search
    print("\n🛑 Interrupção detectada. Parando busca...")
    stop_search = True


def check_interruption():
    """Verifica se a busca foi interrompida"""
    global stop_search
    if stop_search:
        print("⏹️ Busca interrompida pelo usuário.")
        return True
    return False


def clear_screen():
    """Limpa a tela do terminal"""
    os.system('cls' if os.name == 'nt' else 'clear')


def update_status(phase: str, progress: int = 0, total: int = 0, found: int = 0, current_item: str = ""):
    """Atualiza o status da busca"""
    global search_status
    search_status['phase'] = phase
    search_status['progress'] = progress
    search_status['total'] = total
    search_status['found'] = found
    search_status['current_item'] = current_item
    
    if search_status['start_time']:
        search_status['elapsed_time'] = time.time() - search_status['start_time']


def display_status():
    """Exibe o status atual da busca"""
    global search_status
    
    clear_screen()
    
    print("🚀 COLETOR HÍBRIDO DE LEADS - STATUS DA BUSCA")
    print("=" * 60)
    
    if search_status['phase']:
        print(f"📡 Fase Atual: {search_status['phase']}")
        
        if search_status['total'] > 0:
            progress_percent = (search_status['progress'] / search_status['total']) * 100
            print(f"📊 Progresso: {search_status['progress']}/{search_status['total']} ({progress_percent:.1f}%)")
            
            # Barra de progresso visual
            bar_length = 30
            filled_length = int(bar_length * progress_percent / 100)
            bar = '█' * filled_length + '░' * (bar_length - filled_length)
            print(f"   [{bar}] {progress_percent:.1f}%")
        
        if search_status['found'] > 0:
            print(f"✅ Empresas Encontradas: {search_status['found']}")
        
        if search_status['current_item']:
            print(f"🔍 Processando: {search_status['current_item']}")
        
        if search_status['elapsed_time'] > 0:
            elapsed = search_status['elapsed_time']
            print(f"⏱️ Tempo Decorrido: {elapsed:.1f}s")
        
        print("\n" + "=" * 60)
        print("💡 Pressione Ctrl+C para interromper a busca")
        print("=" * 60)
    else:
        print("⏳ Aguardando início da busca...")
        print("\n" + "=" * 60)


def get_user_input() -> tuple:
    """
    Obtém entrada do usuário para nova busca.
    
    Returns:
        tuple: (nicho, cidade, confirmar)
    """
    print("\n" + "="*60)
    print("🔍 NOVA BUSCA DE LEADS")
    print("="*60)
    
    # Obter nicho
    while True:
        nicho = input("\n📋 Digite o nicho de mercado (ex: consultoria financeira): ").strip()
        if nicho:
            break
        print("❌ Nicho é obrigatório!")
    
    # Obter cidade
    while True:
        cidade = input("🏙️ Digite a cidade (ex: São Paulo): ").strip()
        if cidade:
            break
        print("❌ Cidade é obrigatória!")
    
    # Confirmar busca
    print(f"\n📊 Resumo da busca:")
    print(f"   • Nicho: {nicho}")
    print(f"   • Cidade: {cidade}")
    
    while True:
        confirmar = input("\n✅ Confirmar busca? (s/n): ").strip().lower()
        if confirmar in ['s', 'sim', 'y', 'yes']:
            return nicho, cidade, True
        elif confirmar in ['n', 'não', 'nao', 'no']:
            return nicho, cidade, False
        else:
            print("❌ Digite 's' para sim ou 'n' para não")


def search_process(nicho: str, cidade: str) -> List[Dict[str, str]]:
    """
    Processo de busca principal.
    
    Args:
        nicho (str): Nicho de mercado
        cidade (str): Cidade para busca
    
    Returns:
        List[Dict[str, str]]: Lista de leads encontrados
    """
    global stop_search, search_results, search_status
    
    try:
        # Inicializar status
        search_status['start_time'] = time.time()
        search_status['found'] = 0
        update_status("Iniciando busca...")
        display_status()
        
        print(f"\n🚀 Iniciando busca: {nicho} em {cidade}")
        
        # Validar API key
        update_status("Validando API key...")
        display_status()
        
        if not validate_api_key(API_KEY):
            print("❌ API key inválida ou não configurada!")
            return []
        
        print("✅ API key válida!")
        
        # Verificar interrupção
        if check_interruption():
            return []
        
        # Fase 1: Coleta de dados via API
        update_status("Fase 1: Coletando dados via Google Places API", 0, 1, 0)
        display_status()
        
        start_time = time.time()
        
        # Simular progresso da API (em uma implementação real, isso seria baseado nas chamadas reais)
        for i in range(3):
            if check_interruption():
                return []
            update_status("Fase 1: Coletando dados via Google Places API", i+1, 3, 0, f"Chamada {i+1}/3")
            display_status()
            time.sleep(0.5)
        
        business_data = get_business_data_from_api(API_KEY, nicho, cidade)
        api_time = time.time() - start_time
        
        if check_interruption():
            return []
        
        if not business_data:
            print("❌ Nenhum dado encontrado na API.")
            return []
        
        update_status("Fase 1: Coletando dados via Google Places API", 3, 3, len(business_data))
        display_status()
        
        print(f"✅ Fase 1 concluída em {api_time:.2f}s")
        print(f"📊 {len(business_data)} empresas encontradas")
        
        # Verificar interrupção
        if check_interruption():
            return []
        
        # Fase 2: Enriquecimento via scraping
        update_status("Fase 2: Enriquecendo dados via scraping", 0, len(business_data), len(business_data))
        display_status()
        
        start_time = time.time()
        enriched_data = []
        
        for i, business in enumerate(business_data, 1):
            # Verificar interrupção a cada empresa
            if check_interruption():
                print(f"⏹️ Processamento interrompido na empresa {i}")
                break
            
            # Atualizar status
            update_status("Fase 2: Enriquecendo dados via scraping", i, len(business_data), len(business_data), business.get('nome', f'Empresa {i}'))
            display_status()
            
            print(f"📊 Enriquecendo lead {i}/{len(business_data)}...")
            
            enriched_business = enrich_data_with_scraping(business)
            enriched_data.append(enriched_business)
            
            # Pequeno delay para não sobrecarregar os servidores
            time.sleep(0.5)
        
        scraping_time = time.time() - start_time
        
        if not check_interruption():
            update_status("Fase 2: Enriquecendo dados via scraping", len(business_data), len(business_data), len(enriched_data))
            display_status()
            print(f"✅ Fase 2 concluída em {scraping_time:.2f}s")
        
        return enriched_data
        
    except Exception as e:
        print(f"❌ Erro durante a busca: {str(e)}")
        return []


def save_results(enriched_data: List[Dict[str, str]], nicho: str, cidade: str) -> str:
    """
    Salva os resultados em arquivo CSV.
    
    Args:
        enriched_data (List[Dict[str, str]]): Dados enriquecidos
        nicho (str): Nicho da busca
        cidade (str): Cidade da busca
    
    Returns:
        str: Nome do arquivo salvo
    """
    if not enriched_data:
        print("❌ Nenhum dado para salvar.")
        return ""
    
    # Atualizar status
    update_status("Salvando resultados...", 1, 1, len(enriched_data))
    display_status()
    
    # Converter para DataFrame
    df = pd.DataFrame(enriched_data)
    
    # Reorganizar colunas
    column_order = ['nome', 'telefone', 'email', 'site', 'linkedin', 'facebook', 'endereco']
    df = df.reindex(columns=column_order)
    
    # Gerar nome do arquivo com timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nicho_clean = nicho.replace(" ", "_").replace("/", "_")[:20]
    cidade_clean = cidade.replace(" ", "_").replace("/", "_")[:20]
    
    output_file = f'leads_{nicho_clean}_{cidade_clean}_{timestamp}.csv'
    
    # Salvar em CSV
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    
    # Estatísticas
    emails_encontrados = len(df[df['email'].notna() & (df['email'] != '')])
    linkedin_encontrados = len(df[df['linkedin'].notna() & (df['linkedin'] != '')])
    facebook_encontrados = len(df[df['facebook'].notna() & (df['facebook'] != '')])
    
    # Limpar tela e mostrar resultados finais
    clear_screen()
    print("🎉 BUSCA CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print(f"📈 ESTATÍSTICAS FINAIS:")
    print(f"   • Total de empresas: {len(df)}")
    print(f"   • E-mails encontrados: {emails_encontrados}")
    print(f"   • LinkedIn encontrados: {linkedin_encontrados}")
    print(f"   • Facebook encontrados: {facebook_encontrados}")
    print(f"   • Tempo total: {search_status['elapsed_time']:.2f}s")
    print(f"\n💾 Dados salvos em: {output_file}")
    
    return output_file


def show_menu():
    """Exibe menu principal"""
    print("\n" + "="*60)
    print("🎯 COLETOR HÍBRIDO DE LEADS - MENU PRINCIPAL")
    print("="*60)
    print("1. 🔍 Fazer nova busca")
    print("2. 📊 Ver última busca")
    print("3. 📖 Como usar")
    print("4. 🚪 Sair")
    print("="*60)


def show_usage_info():
    """Exibe informações sobre como usar o sistema"""
    print("\n📖 COMO USAR O COLETOR HÍBRIDO DE LEADS")
    print("=" * 60)
    print()
    print("1. 🔑 Configure sua API key:")
    print("   • Acesse: https://developers.google.com/maps/documentation/places/web-service/get-api-key")
    print("   • Crie um projeto e habilite a Places API")
    print("   • Copie a chave e substitua 'SUA_CHAVE_API_AQUI' no arquivo main.py")
    print()
    print("2. ⚙️ Configure os parâmetros de busca:")
    print("   • NICHO_BUSCA: Tipo de empresa (ex: 'consultoria financeira')")
    print("   • CIDADE_BUSCA: Cidade para busca (ex: 'São Paulo')")
    print()
    print("3. 🚀 Execute o programa:")
    print("   python main.py")
    print()
    print("4. 📊 Resultados:")
    print("   • Os dados serão salvos em arquivos CSV com timestamp")
    print("   • Abra os arquivos no Excel ou Google Sheets")
    print()
    print("💡 DICAS:")
    print("   • Use termos específicos para melhores resultados")
    print("   • O processo pode levar alguns minutos")
    print("   • Respeite os rate limits da API")
    print("   • Pressione Ctrl+C para interromper uma busca")
    print("   • O status é atualizado em tempo real")


def main() -> None:
    """
    Função principal que orquestra todo o processo de coleta de leads.
    """
    global stop_search, current_search_thread, search_results, search_status
    
    # Configurar handler de sinal para Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    print("🚀 Iniciando Coletor Híbrido de Leads")
    print("💡 Pressione Ctrl+C a qualquer momento para interromper uma busca")
    print("📊 Status em tempo real disponível durante a busca")
    
    while True:
        try:
            show_menu()
            
            choice = input("\nEscolha uma opção (1-4): ").strip()
            
            if choice == "1":
                # Nova busca
                stop_search = False
                search_status = {
                    'phase': '',
                    'progress': 0,
                    'total': 0,
                    'found': 0,
                    'current_item': '',
                    'start_time': None,
                    'elapsed_time': 0
                }
                
                nicho, cidade, confirmar = get_user_input()
                
                if confirmar:
                    print(f"\n🎯 Iniciando busca para: {nicho} em {cidade}")
                    print("⏳ Processando... (pressione Ctrl+C para interromper)")
                    
                    # Executar busca
                    search_results = search_process(nicho, cidade)
                    
                    if search_results and not stop_search:
                        # Salvar resultados
                        output_file = save_results(search_results, nicho, cidade)
                        if output_file:
                            print("🎉 Busca concluída com sucesso!")
                    
                    elif stop_search:
                        print("⏹️ Busca interrompida pelo usuário.")
                    
                    else:
                        print("❌ Nenhum resultado encontrado.")
                
                else:
                    print("❌ Busca cancelada pelo usuário.")
            
            elif choice == "2":
                # Ver última busca
                if search_results:
                    print(f"\n📊 ÚLTIMA BUSCA - {len(search_results)} resultados:")
                    print("-" * 50)
                    
                    for i, lead in enumerate(search_results[:5], 1):
                        print(f"\n{i}. {lead.get('nome', 'N/A')}")
                        print(f"   📞 {lead.get('telefone', 'N/A')}")
                        print(f"   📧 {lead.get('email', 'N/A')}")
                        print(f"   🌐 {lead.get('site', 'N/A')}")
                    
                    if len(search_results) > 5:
                        print(f"\n... e mais {len(search_results) - 5} resultados")
                else:
                    print("❌ Nenhuma busca realizada ainda.")
            
            elif choice == "3":
                # Como usar
                show_usage_info()
            
            elif choice == "4":
                # Sair
                print("\n👋 Obrigado por usar o Coletor Híbrido de Leads!")
                print("🎉 Até a próxima!")
                break
            
            else:
                print("❌ Opção inválida. Escolha 1, 2, 3 ou 4.")
        
        except KeyboardInterrupt:
            print("\n\n🛑 Interrupção detectada. Voltando ao menu...")
            stop_search = True
            continue
        
        except Exception as e:
            print(f"\n❌ Erro inesperado: {str(e)}")
            print("🔄 Voltando ao menu principal...")
            continue


if __name__ == "__main__":
    # Verificar se a API key está configurada
    if API_KEY == "SUA_CHAVE_API_AQUI":
        print("⚠️ API key não configurada!")
        print()
        show_usage_info()
    else:
        main()
