from flask import Flask, render_template, request, jsonify, send_file
import os
import json
from datetime import datetime
import shutil

app = Flask(__name__)

# Configurações
TEMPLATES_DIR = 'templates'
VARIABLES_FILE = 'variables.json'
CONFIG_FILE = 'config.json'

# Criar diretórios necessários
os.makedirs(TEMPLATES_DIR, exist_ok=True)

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/editor')
def editor():
    template_name = request.args.get('template', 'default')
    return render_template('editor.html', template_name=template_name)

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
    variables = request.json
    template_name = request.args.get('template', 'default')
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

@app.route('/api/templates', methods=['GET'])
def get_templates():
    templates = []
    for filename in os.listdir(TEMPLATES_DIR):
        if filename.endswith('.html'):
            template_name = filename[:-5]
            templates.append({
                'nome': template_name,
                'caminho': f'/editor?template={template_name}'
            })
    return jsonify(templates)

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

if __name__ == '__main__':
    app.run(debug=True) 