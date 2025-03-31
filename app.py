from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
import os
import json
from datetime import datetime
import shutil
import re

app = Flask(__name__,
    static_folder='Front/static',  # Atualizado para o caminho correto
    template_folder='Front'
)

# Configurações
TEMPLATES_DIR = 'templates'
VARIABLES_FILE = 'variables.json'
CONFIG_FILE = 'config.json'
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Front', 'static')

# Criar diretórios necessários
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

# Servir arquivos estáticos do diretório Front/static
@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        print(f"Tentando servir arquivo estático: {filename}")  # Log para debug
        print(f"Diretório estático: {STATIC_DIR}")  # Log para debug
        return send_from_directory(STATIC_DIR, filename)
    except Exception as e:
        print(f"Erro ao servir arquivo estático {filename}: {str(e)}")
        return f"Arquivo não encontrado: {filename}", 404

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=4)

def load_variables():
    if os.path.exists(VARIABLES_FILE):
        with open(VARIABLES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_variables(variables):
    with open(VARIABLES_FILE, 'w', encoding='utf-8') as f:
        json.dump(variables, f, ensure_ascii=False, indent=4)

def get_template_path(template_name):
    return os.path.join(TEMPLATES_DIR, f'{template_name}.html')

def get_template_content(template_name):
    template_path = get_template_path(template_name)
    if os.path.exists(template_path):
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    return None

def extract_template_variables(template_content):
    # Padrão para encontrar variáveis no formato {{variavel}} ou {{objeto.variavel}}
    pattern = r'\{\{([^}]+)\}\}'
    variables = set()

    # Encontra todas as variáveis no template
    matches = re.findall(pattern, template_content)

    for match in matches:
        # Remove espaços em branco
        var = match.strip()
        variables.add(var)

    return list(variables)

def get_template_variables(template_name):
    config = load_template_config()
    if template_name in config:
        return config[template_name].get('variables', [])
    return []

def load_template_config():
    config_path = os.path.join('template_configs', 'template_variables.json')
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        print(f"Arquivo de configuração não encontrado: {config_path}")
        return {}
    except Exception as e:
        print(f"Erro ao carregar configuração: {str(e)}")
        return {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/templates')
def templates():
    try:
        templates_list = []
        for filename in os.listdir(TEMPLATES_DIR):
            if filename.endswith('.html'):
                template_name = filename[:-5]
                templates_list.append({
                    'nome': template_name,
                    'caminho': f'/editor?template={template_name}'
                })
        return render_template('templates.html', templates=templates_list)
    except Exception as e:
        print(f"Erro ao listar templates: {str(e)}")
        return render_template('templates.html', error=str(e))

@app.route('/config')
def config():
    try:
        variables = load_variables()
        config = load_config()
        return render_template('config.html', variables=variables, config=config)
    except Exception as e:
        print(f"Erro ao carregar configurações: {str(e)}")
        return render_template('config.html', error=str(e))

@app.route('/editor')
def editor():
    try:
        # Carrega todos os templates disponíveis
        templates = []
        for filename in os.listdir(TEMPLATES_DIR):
            if filename.endswith('.html'):
                template_name = filename[:-5]
                templates.append({
                    'nome': template_name,
                    'caminho': f'/editor?template={template_name}'
                })

        # Pega o template selecionado da URL
        selected_template = request.args.get('template', '')

        # Carrega as variáveis do template selecionado
        template_variables = []
        if selected_template:
            config = load_template_config()
            if selected_template in config:
                template_variables = config[selected_template].get('variables', [])
                print(f"Variáveis carregadas para {selected_template}:", template_variables)
            else:
                print(f"Template {selected_template} não encontrado na configuração")

        # Renderiza o template com os dados
        return render_template('editor.html',
                            templates=templates,
                            selected_template=selected_template,
                            template_variables=template_variables)
    except Exception as e:
        print(f"Erro ao carregar editor: {str(e)}")
        return render_template('editor.html', error=str(e))

@app.route('/api/variables', methods=['GET'])
def get_variables():
    return jsonify(load_variables())

@app.route('/api/variables', methods=['POST'])
def update_variables():
    variables = request.json
    save_variables(variables)
    return jsonify({'status': 'success'})

@app.route('/api/preview', methods=['POST'])
def generate_preview():
    try:
        variables = request.json
        template_name = request.args.get('template', '')
        template_content = get_template_content(template_name)

        if not template_content:
            return jsonify({'error': 'Template não encontrado'}), 404

        # Substituir variáveis no template
        for key, value in variables.items():
            if isinstance(value, dict):
                for subkey, subvalue in value.items():
                    template_content = template_content.replace(f'{{{{{key}.{subkey}}}}}', str(subvalue))
            else:
                template_content = template_content.replace(f'{{{{{key}}}}}', str(value))

        return template_content
    except Exception as e:
        print(f"Erro ao gerar preview: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    try:
        templates = []
        for filename in os.listdir(TEMPLATES_DIR):
            if filename.endswith('.html'):
                template_name = filename[:-5]
                templates.append({
                    'nome': template_name,
                    'caminho': f'/editor?template={template_name}'
                })
        print("Templates encontrados:", templates)  # Log para debug
        return jsonify(templates)
    except Exception as e:
        print(f"Erro ao listar templates: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['POST'])
def create_template():
    data = request.json
    template_name = data.get('nome')
    conteudo = data.get('conteudo')

    if not template_name or not conteudo:
        return jsonify({'error': 'Nome e conteúdo são obrigatórios'}), 400

    template_path = get_template_path(template_name)
    if os.path.exists(template_path):
        return jsonify({'error': 'Template já existe'}), 409

    with open(template_path, 'w', encoding='utf-8') as f:
        f.write(conteudo)

    return jsonify({'status': 'success'})

@app.route('/api/templates/<template_name>', methods=['PUT'])
def update_template(template_name):
    data = request.json
    conteudo = data.get('conteudo')

    if not conteudo:
        return jsonify({'error': 'Conteúdo é obrigatório'}), 400

    template_path = get_template_path(template_name)
    if not os.path.exists(template_path):
        return jsonify({'error': 'Template não encontrado'}), 404

    with open(template_path, 'w', encoding='utf-8') as f:
        f.write(conteudo)

    return jsonify({'status': 'success'})

@app.route('/api/templates/<template_name>', methods=['DELETE'])
def delete_template(template_name):
    template_path = get_template_path(template_name)
    if not os.path.exists(template_path):
        return jsonify({'error': 'Template não encontrado'}), 404

    os.remove(template_path)
    return jsonify({'status': 'success'})

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def update_config():
    config = request.json
    save_config(config)
    return jsonify({'status': 'success'})

@app.route('/api/templates/<template_name>/variables', methods=['GET'])
def get_template_specific_variables(template_name):
    try:
        print(f"Buscando variáveis para o template: {template_name}")
        config = load_template_config()

        if template_name in config:
            variables = config[template_name].get('variables', [])
            print(f"Variáveis encontradas: {variables}")
            return jsonify({'variables': variables})
        else:
            print(f"Template {template_name} não encontrado na configuração")
            return jsonify({'error': 'Template não encontrado'}), 404
    except Exception as e:
        print(f"Erro ao buscar variáveis: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
