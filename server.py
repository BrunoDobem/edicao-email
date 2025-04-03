from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
import re
import traceback
from jinja2 import Environment, FileSystemLoader
import shutil

app = Flask(__name__,
    template_folder='.',  # Define o diretório raiz como pasta de templates
    static_folder='static'
)

# Configuração do Jinja2
env = Environment(
    loader=FileSystemLoader(['templates', 'Front']),
    autoescape=True
)

# Caminho para o arquivo de variáveis
VARIABLES_FILE = 'config/variables.json'
CONFIG_FILE = 'config/config.json'

def carregar_variaveis():
    """Carrega as variáveis do arquivo JSON."""
    if os.path.exists(VARIABLES_FILE):
        with open(VARIABLES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def salvar_variaveis(variaveis):
    """Salva as variáveis no arquivo JSON."""
    os.makedirs(os.path.dirname(VARIABLES_FILE), exist_ok=True)
    with open(VARIABLES_FILE, 'w', encoding='utf-8') as f:
        json.dump(variaveis, f, ensure_ascii=False, indent=2)

def carregar_config():
    """Carrega as configurações do arquivo JSON."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'default_template': 'base',
        'preview_scale': 0.8
    }

def salvar_config(config):
    """Salva as configurações no arquivo JSON."""
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

def processar_tracklinks(html):
    """
    Substitui todos os links no HTML pelo formato correto do TrackLink para Listmonk.
    Verifica todos os destinos para garantir que os links sejam processados corretamente.
    """
    try:
        # Encontrar todos os atributos href que contenham URLs http
        pattern = r'href="(https?://[^"]+)"'

        def substituir_tracklink(match):
            url = match.group(1)
            # Ajustar URLs com caracteres especiais ou espaços para evitar problemas
            # Formato exato solicitado: href="{{TrackLink  "URL"}}"
            return f'href="{{{{TrackLink  "{url}"}}}}"'

        # Substituir todos os links pelo formato TrackLink
        html_processado = re.sub(pattern, substituir_tracklink, html)

        # Verificar específicamente cada destino por nome
        destinos = ["destino1", "destino2", "destino3", "destino4"]
        for destino in destinos:
            if f'href="{{{{{destino}.link}}}}' in html_processado:
                print(f"Link não processado detectado para {destino}")

                # Tentar processar manualmente com expressão regular mais específica
                destino_pattern = f'href="{{{{({destino}\.link)}}}}"'
                html_processado = re.sub(destino_pattern,
                                        lambda m: f'href="{{{{TrackLink  "${{m.group(1)}}"}}}}',
                                        html_processado)

                print(f"Aplicada correção manual para {destino}")

        return html_processado
    except Exception as e:
        print(f"Erro ao processar tracklinks: {str(e)}")
        traceback.print_exc()
        return html

def listar_templates():
    """Lista todos os templates disponíveis."""
    templates_dir = 'templates'
    templates = []

    # Lista de arquivos do sistema que devem ser ignorados
    arquivos_sistema = ['templates.html', 'config.html', 'index.html','default.html']

    for filename in os.listdir(templates_dir):
        if filename.endswith('.html') and filename not in arquivos_sistema:
            template_name = filename.replace('.html', '')
            templates.append({
                'nome': template_name,
                'arquivo': filename,
                'caminho': f'/preview/{template_name}'
            })
    return templates

@app.route('/')
def index():
    """Rota principal que renderiza a página inicial."""
    return send_from_directory('.', 'index.html')

@app.route('/templates')
def templates():
    """Rota para a página de gerenciamento de templates."""
    templates_list = listar_templates()
    return render_template('Front/templates.html', templates=templates_list)

@app.route('/config')
def config():
    """Rota para a página de configurações."""
    variaveis = carregar_variaveis()
    config = carregar_config()
    return render_template('Front/config.html', variaveis=variaveis, config=config)

@app.route('/editor')
def editor():
    """Rota para o editor de email."""
    return send_from_directory('editor', 'index.html')

# APIs para gerenciamento de templates
@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Retorna a lista de templates."""
    try:
        return jsonify(listar_templates())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates/<nome>', methods=['POST'])
def criar_template(nome):
    """Cria um novo template baseado em um existente."""
    try:
        template_base = request.json.get('base_template', 'base')
        novo_arquivo = f'templates/{nome}.html'
        arquivo_base = f'templates/{template_base}.html'

        if not os.path.exists(arquivo_base):
            return jsonify({'error': 'Template base não encontrado'}), 404

        shutil.copy2(arquivo_base, novo_arquivo)
        return jsonify({'message': 'Template criado com sucesso'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates/<nome>', methods=['DELETE'])
def deletar_template(nome):
    """Deleta um template existente."""
    try:
        arquivo = f'templates/{nome}.html'
        if not os.path.exists(arquivo):
            return jsonify({'error': 'Template não encontrado'}), 404

        os.remove(arquivo)
        return jsonify({'message': 'Template deletado com sucesso'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates/<nome>/duplicate', methods=['POST'])
def duplicar_template(nome):
    """Duplica um template existente."""
    try:
        novo_nome = request.json.get('novo_nome')
        if not novo_nome:
            return jsonify({'error': 'Nome do novo template não fornecido'}), 400

        arquivo_original = f'templates/{nome}.html'
        novo_arquivo = f'templates/{novo_nome}.html'

        if not os.path.exists(arquivo_original):
            return jsonify({'error': 'Template original não encontrado'}), 404

        shutil.copy2(arquivo_original, novo_arquivo)
        return jsonify({'message': 'Template duplicado com sucesso'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# APIs para configurações
@app.route('/api/config', methods=['GET'])
def get_config():
    """Retorna as configurações atuais."""
    try:
        return jsonify(carregar_config())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['POST'])
def update_config():
    """Atualiza as configurações."""
    try:
        config = request.get_json()
        if not config:
            return jsonify({'error': 'Dados não fornecidos'}), 400

        salvar_config(config)
        return jsonify({'message': 'Configurações atualizadas com sucesso'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# APIs existentes
@app.route('/api/variables', methods=['GET'])
def get_variables():
    """Retorna as variáveis atuais."""
    try:
        return jsonify(carregar_variaveis())
    except Exception as e:
        print(f"Erro ao carregar variáveis: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/variables', methods=['POST'])
def update_variables():
    """Atualiza as variáveis."""
    try:
        variaveis = request.get_json()
        if not variaveis:
            return jsonify({'error': 'Dados não fornecidos'}), 400

        salvar_variaveis(variaveis)
        return jsonify({'message': 'Variáveis atualizadas com sucesso'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview', methods=['POST'])
def preview():
    """Gera um preview do template com as variáveis fornecidas."""
    try:
        variaveis = request.get_json()
        if not variaveis:
            return jsonify({'error': 'Dados não fornecidos'}), 400

        # Obter o template selecionado
        template_name = variaveis.get('template', 'base')
        template_path = os.path.join('templates', f'{template_name}.html')

        if not os.path.exists(template_path):
            return jsonify({'error': f'Template {template_name} não encontrado'}), 404

        # Garantir que todas as variáveis necessárias existam
        variaveis_padrao = carregar_variaveis()

        # Adicionar variáveis que possam estar faltando
        for key, value in variaveis_padrao.items():
            if key not in variaveis:
                variaveis[key] = value
                print(f"Adicionando variável ausente: {key}")
            elif isinstance(value, dict) and isinstance(variaveis.get(key), dict):
                for sub_key, sub_value in value.items():
                    if sub_key not in variaveis[key]:
                        variaveis[key][sub_key] = sub_value
                        print(f"Adicionando subvariável ausente: {key}.{sub_key}")

        # Adicionar variável de título se não existir (para retrocompatibilidade)
        if 'titulo' not in variaveis and 'titulo_principal' in variaveis:
            variaveis['titulo'] = variaveis['titulo_principal']

        # Verificar especificamente o destino2
        if 'destino2' in variaveis:
            print("Dados do destino2:")
            for k, v in variaveis['destino2'].items():
                print(f"  {k}: {v}")
        else:
            print("destino2 não encontrado nas variáveis!")

        # Renderizar o template selecionado
        template = env.get_template(f'{template_name}.html')
        html = template.render(**variaveis)

        # Verificar se o destino2.link está sendo renderizado corretamente
        if "{{destino2.link}}" in html:
            print("ERRO: destino2.link não foi renderizado!")

        # Processar manualmente os links dos destinos
        for i in range(1, 5):
            destino_key = f"destino{i}"
            if destino_key in variaveis and 'link' in variaveis[destino_key]:
                link_url = variaveis[destino_key]['link']

                # Verificar se o link ainda está no formato de template
                template_pattern = f'href="{{{{destino{i}.link}}}}"'
                if template_pattern in html:
                    html = html.replace(template_pattern, f'href="{link_url}"')
                    print(f"Substituição manual de template para {destino_key}")

                # Aplicar o TrackLink ao URL
                html = html.replace(f'href="{link_url}"', f'href="{{{{TrackLink  "{link_url}"}}}}"')
                print(f"TrackLink aplicado manualmente para {destino_key}")

        # Processar os links restantes para o formato TrackLink
        html_final = processar_tracklinks(html)

        return html_final
    except Exception as e:
        print(f"Erro ao gerar preview: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/preview/<template_name>')
def preview_template(template_name):
    """Rota para visualizar um template específico."""
    try:
        template_path = os.path.join('templates', f'{template_name}.html')
        if not os.path.exists(template_path):
            return "Template não encontrado", 404

        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()

        # Carregar variáveis padrão
        variaveis = carregar_variaveis()

        # Renderizar o template com as variáveis
        template = env.from_string(template_content)
        return template.render(**variaveis)
    except Exception as e:
        return f"Erro ao carregar template: {str(e)}", 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos."""
    return send_from_directory('static', filename)

# Para funcionar tanto localmente quanto na Vercel
if __name__ == '__main__':
    app.run(debug=True)

# Esta linha é necessária para o Vercel
app = app
