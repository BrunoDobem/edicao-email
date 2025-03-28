from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
import re
import traceback
from jinja2 import Environment, FileSystemLoader
import uuid

app = Flask(__name__)

# Configuração do Jinja2
env = Environment(
    loader=FileSystemLoader('templates'),
    autoescape=True
)

# Caminhos para os arquivos de configuração
VARIABLES_FILE = 'config/variables.json'
TEMPLATES_FILE = 'config/templates.json'

def carregar_templates():
    """Carrega a configuração dos templates."""
    if os.path.exists(TEMPLATES_FILE):
        with open(TEMPLATES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"templates": []}

def salvar_templates(templates):
    """Salva a configuração dos templates."""
    os.makedirs(os.path.dirname(TEMPLATES_FILE), exist_ok=True)
    with open(TEMPLATES_FILE, 'w', encoding='utf-8') as f:
        json.dump(templates, f, ensure_ascii=False, indent=4)

def detectar_variaveis(html):
    """Detecta variáveis Jinja2 no template HTML."""
    variaveis = {}
    # Padrão para encontrar variáveis Jinja2
    padrao = r'\{\{([^}]+)\}\}'
    
    # Encontra todas as variáveis no template
    matches = re.finditer(padrao, html)
    for match in matches:
        var = match.group(1).strip()
        # Ignora funções e filtros
        if '(' in var or '|' in var:
            continue
            
        # Processa variáveis aninhadas
        partes = var.split('.')
        atual = variaveis
        for i, parte in enumerate(partes):
            if i == len(partes) - 1:
                atual[parte] = f"Descrição para {parte}"
            else:
                if parte not in atual:
                    atual[parte] = {}
                atual = atual[parte]
    
    return variaveis

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

@app.route('/')
def index():
    """Rota principal que renderiza a interface de edição."""
    return send_from_directory('editor', 'index.html')

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Retorna a lista de templates disponíveis."""
    try:
        return jsonify(carregar_templates())
    except Exception as e:
        print(f"Erro ao carregar templates: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['POST'])
def add_template():
    """Adiciona um novo template."""
    try:
        dados = request.get_json()
        if not dados or 'html' not in dados or 'name' not in dados:
            return jsonify({'error': 'Dados incompletos'}), 400
        
        # Gera um ID único para o template
        template_id = str(uuid.uuid4())
        
        # Detecta variáveis no template
        variaveis = detectar_variaveis(dados['html'])
        
        # Cria o nome do arquivo
        nome_arquivo = f"template_{template_id}.html"
        
        # Salva o arquivo do template
        os.makedirs('templates', exist_ok=True)
        with open(f'templates/{nome_arquivo}', 'w', encoding='utf-8') as f:
            f.write(dados['html'])
        
        # Cria a configuração do template
        novo_template = {
            "id": template_id,
            "name": dados['name'],
            "description": dados.get('description', ''),
            "file": nome_arquivo,
            "variables": variaveis
        }
        
        # Atualiza a lista de templates
        templates = carregar_templates()
        templates['templates'].append(novo_template)
        salvar_templates(templates)
        
        return jsonify(novo_template)
    except Exception as e:
        print(f"Erro ao adicionar template: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
def save_variables():
    """Salva as novas variáveis."""
    try:
        variaveis = request.get_json()
        if not variaveis:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        salvar_variaveis(variaveis)
        return jsonify({'message': 'Variáveis salvas com sucesso'})
    except Exception as e:
        print(f"Erro ao salvar variáveis: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/preview', methods=['POST'])
def preview():
    """Gera um preview do template com as variáveis fornecidas."""
    try:
        dados = request.get_json()
        if not dados or 'template_id' not in dados or 'variables' not in dados:
            return jsonify({'error': 'Dados incompletos'}), 400
        
        # Carrega a configuração do template
        templates = carregar_templates()
        template = next((t for t in templates['templates'] if t['id'] == dados['template_id']), None)
        if not template:
            return jsonify({'error': 'Template não encontrado'}), 404
        
        variaveis = dados['variables']
        
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
        
        # Renderizar o template
        template = env.get_template(template['file'])
        html = template.render(**variaveis)
        
        # Processar os links para o formato TrackLink
        html_final = processar_tracklinks(html)
        
        return html_final
    except Exception as e:
        print(f"Erro ao gerar preview: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos."""
    return send_from_directory('static', filename)

# Para funcionar tanto localmente quanto na Vercel
if __name__ == '__main__':
    app.run(debug=True)
    
# Esta linha é necessária para o Vercel
app = app 