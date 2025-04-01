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
    pattern = r'\{\{\s*([^}]+?)\s*\}\}'
    variables = []

    # Encontra todas as variáveis no template e suas posições
    matches = []
    for match in re.finditer(pattern, template_content):
        var_name = match.group(1).strip()
        position = match.start()
        matches.append((var_name, position))

    # Ordena as variáveis por posição para manter a ordem de aparecimento
    matches.sort(key=lambda x: x[1])

    # Contador para variáveis duplicadas
    var_counters = {}
    var_positions = {}  # Guarda a posição de cada ocorrência da variável

    for var_name, position in matches:
        # Pular variáveis com .Subscriber ou outros templates de listas
        if ".Subscriber" in var_name or "." in var_name:
            if var_name not in variables:
                variables.append(var_name)
            continue

        # Inicializa contador se necessário
        if var_name not in var_counters:
            var_counters[var_name] = 0
            var_positions[var_name] = []

        # Guarda a posição desta ocorrência
        var_positions[var_name].append(position)

        # Adiciona a variável com seu contador, se necessário
        if var_counters[var_name] == 0:
            variables.append(var_name)
        else:
            variables.append(f"{var_name}{var_counters[var_name]}")

        var_counters[var_name] += 1

    print(f"Variáveis extraídas: {variables}")
    print(f"Contadores de variáveis: {var_counters}")

    return variables

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

        # Log para depuração
        print(f"Gerando preview para template: {template_name}")
        print(f"Variáveis recebidas: {variables}")

        # Primeiro, substitui variáveis aninhadas
        for key, value in variables.items():
            if isinstance(value, dict):
                for subkey, subvalue in value.items():
                    pattern = r'\{\{\s*' + re.escape(f"{key}.{subkey}") + r'\s*\}\}'
                    template_content = re.sub(pattern, str(subvalue), template_content)

        # Tratamento especial para Subscriber e outras variáveis de sistema
        # Substituir estas com espaços em branco para evitar erros
        system_vars_pattern = r'\{\{\s*\.Subscriber[^}]*\s*\}\}'
        template_content = re.sub(system_vars_pattern, '', template_content)

        # Novo algoritmo para substituição de variáveis duplicadas
        result_content = template_content

        # 1. Mapeia as variáveis do template mantendo a ordem original
        template_vars = []
        pattern = r'\{\{\s*([^}]+?)\s*\}\}'
        for match in re.finditer(pattern, result_content):
            var_name = match.group(1).strip()
            position = match.start()
            if "." not in var_name and ".Subscriber" not in var_name:
                template_vars.append((var_name, position, match.group(0)))

        print(f"Variáveis encontradas no template (em ordem): {[v[0] for v in template_vars]}")

        # 2. Agrupar variáveis por nome base (sem sufixo numérico)
        var_groups = {}
        for key in variables.keys():
            if isinstance(variables[key], dict):
                continue

            match = re.match(r'^([a-zA-Z_]+)(\d*)$', key)
            if match:
                base_name, suffix = match.groups()
                if base_name not in var_groups:
                    var_groups[base_name] = []
                suffix_num = int(suffix) if suffix else 0
                var_groups[base_name].append((suffix_num, key))

        # Ordena cada grupo por sufixo numérico
        for base_name in var_groups:
            var_groups[base_name].sort(key=lambda x: x[0])
            print(f"Grupo '{base_name}': {var_groups[base_name]}")

        # 3. Contador para rastrear quantas ocorrências de cada base já foram substituídas
        occurrence_counts = {}

        # Cria uma cópia para processar as substituições
        final_content = result_content

        # Lista para controlar quais variáveis já foram processadas para evitar duplicações
        processed_vars = set()

        # 4. Para cada var no template, encontra o valor correspondente baseado na sua ordem de ocorrência
        for var_name, position, var_match in template_vars:
            # Ignora variáveis já processadas (pode acontecer com regex sobrepostos)
            if (var_name, position) in processed_vars:
                continue

            processed_vars.add((var_name, position))

            # Primeiro, tenta substituição exata (se o nome da variável com número existir)
            if var_name in variables:
                value = variables[var_name]
                pattern = re.escape(var_match)
                final_content = re.sub(pattern, str(value), final_content, count=1)
                print(f"Substituição exata: {var_match} => '{value}'")
                continue

            # Caso a variável seja um nome base (sem número), precisamos usar a ordem de aparecimento
            # para determinar qual valor numerado usar (texto -> texto, texto1, texto2, etc.)
            base_match = re.match(r'^([a-zA-Z_]+)$', var_name)
            if base_match and base_match.group(1) in var_groups:
                base_name = base_match.group(1)

                # Inicializa o contador para esta base se ainda não existir
                if base_name not in occurrence_counts:
                    occurrence_counts[base_name] = 0

                # Obtém o índice atual para esta base
                current_index = occurrence_counts[base_name]

                # Incrementa o contador para a próxima ocorrência
                occurrence_counts[base_name] += 1

                # Verifica se temos variáveis suficientes para este índice
                if current_index < len(var_groups[base_name]):
                    _, var_key = var_groups[base_name][current_index]
                    value = variables[var_key]
                    pattern = re.escape(var_match)
                    final_content = re.sub(pattern, str(value), final_content, count=1)
                    print(f"Substituição por ordem: {var_match} (ocorrência {current_index}) => '{value}' de {var_key}")

        # Verifica se há variáveis não substituídas
        remaining_vars = re.findall(r'\{\{\s*([^}]+?)\s*\}\}', final_content)
        if remaining_vars:
            print(f"Variáveis não substituídas: {remaining_vars}")

        print(f"Status da resposta do preview: 200")
        print(f"Preview atualizado com sucesso, tamanho do HTML: {len(final_content)}")

        return final_content
    except Exception as e:
        print(f"Erro ao gerar preview: {str(e)}")
        import traceback
        traceback.print_exc()
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

@app.route('/create')
def create_template():
    return send_file('Front/create_template.html')

@app.route('/api/templates', methods=['POST'])
def create_new_template():
    try:
        data = request.get_json()
        template_name = data.get('name')
        template_description = data.get('description')
        template_html = data.get('html')
        template_variables = data.get('variables', [])

        if not template_name or not template_html:
            return jsonify({'error': 'Nome e HTML do template são obrigatórios'}), 400

        # Verifica se o template já existe
        template_path = os.path.join(TEMPLATES_DIR, f"{template_name}.html")
        if os.path.exists(template_path):
            return jsonify({'error': 'Já existe um template com este nome'}), 400

        # Corrige formatação das variáveis no HTML
        template_html = template_html.replace('{{{', '{{ ')
        template_html = template_html.replace('}}}', ' }}')
        template_html = template_html.replace('{{', '{{ ')
        template_html = template_html.replace('}}', ' }}')

        # Salva o arquivo HTML do template
        with open(template_path, 'w', encoding='utf-8') as f:
            f.write(template_html)

        # Processa as variáveis para remover duplicatas
        unique_variables = []
        seen_variables = set()

        for variable in template_variables:
            variable = variable.strip()
            if variable and variable not in seen_variables:
                unique_variables.append(variable)
                seen_variables.add(variable)

        # Extrai as variáveis adicionais do HTML se alguma foi perdida
        extracted_variables = extract_template_variables(template_html)
        for variable in extracted_variables:
            variable = variable.strip()
            if variable and variable not in seen_variables:
                unique_variables.append(variable)
                seen_variables.add(variable)

        # Atualiza o arquivo de configuração de variáveis
        config_path = os.path.join('template_configs', 'template_variables.json')
        os.makedirs(os.path.dirname(config_path), exist_ok=True)

        try:
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
            else:
                config = {}
        except (FileNotFoundError, json.JSONDecodeError):
            config = {}

        # Organiza as variáveis em simples e aninhadas
        simple_variables = []
        nested_variables = {}

        for variable in unique_variables:
            if '.' in variable:
                parent, child = variable.split('.', 1)
                if parent not in nested_variables:
                    nested_variables[parent] = []
                if child not in nested_variables[parent]:
                    nested_variables[parent].append(child)
                if parent not in simple_variables:
                    simple_variables.append(parent)
            else:
                if variable not in simple_variables:
                    simple_variables.append(variable)

        # Adiciona o novo template à configuração
        config[template_name] = {
            'variables': simple_variables,
            'description': template_description
        }

        # Adiciona variáveis aninhadas se existirem
        if nested_variables:
            config[template_name]['nested_variables'] = nested_variables

        # Salva a configuração atualizada
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=4)

        return jsonify({'status': 'success', 'template': template_name})
    except Exception as e:
        print(f"Erro ao criar template: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates/<template_name>', methods=['DELETE'])
def delete_template(template_name):
    try:
        # Remove o arquivo HTML do template
        template_path = os.path.join(TEMPLATES_DIR, f"{template_name}.html")
        if os.path.exists(template_path):
            os.remove(template_path)

        # Atualiza o arquivo de configuração
        config_path = os.path.join('template_configs', 'template_variables.json')
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # Remove o template da configuração
        if template_name in config:
            del config[template_name]

        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=4, ensure_ascii=False)

        return jsonify({'message': 'Template removido com sucesso'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def update_config():
    config = request.json
    save_config(config)
    return jsonify({'status': 'success'})

@app.route('/api/templates/<template_name>/variables')
def get_template_specific_variables(template_name):
    try:
        config_path = os.path.join('template_configs', 'template_variables.json')
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Verifica se o template existe na configuração
            if template_name in config:
                # Obtém as variáveis do template
                template_config = config[template_name]
                variables = template_config.get('variables', [])

                # Se existem variáveis aninhadas, adiciona no formato parent.child
                nested_variables = template_config.get('nested_variables', {})
                processed_variables = []

                # Processa as variáveis para remover duplicatas e adicionar variáveis aninhadas
                variable_set = set()
                for variable in variables:
                    if variable not in variable_set:
                        processed_variables.append(variable)
                        variable_set.add(variable)

                # Adiciona as variáveis aninhadas
                for parent, children in nested_variables.items():
                    for child in children:
                        nested_var = f"{parent}.{child}"
                        if nested_var not in variable_set:
                            processed_variables.append(nested_var)
                            variable_set.add(nested_var)

                print(f"Variáveis processadas para {template_name}:", processed_variables)
                return jsonify({"variables": processed_variables})
            else:
                print(f"Template {template_name} não encontrado na configuração")

                # Se o template não existe na configuração, tenta extrair as variáveis do arquivo HTML
                template_path = get_template_path(template_name)
                if os.path.exists(template_path):
                    with open(template_path, 'r', encoding='utf-8') as f:
                        template_content = f.read()

                    # Extrai as variáveis diretamente do HTML
                    extracted_variables = extract_template_variables(template_content)
                    print(f"Variáveis extraídas do HTML para {template_name}:", extracted_variables)

                    # Salva as variáveis extraídas na configuração
                    config[template_name] = {
                        "variables": extracted_variables,
                        "description": template_name
                    }

                    with open(config_path, 'w', encoding='utf-8') as f:
                        json.dump(config, f, ensure_ascii=False, indent=4)

                    return jsonify({"variables": extracted_variables})

                return jsonify({"error": f"Template {template_name} não encontrado"}), 404
        else:
            return jsonify({"error": "Arquivo de configuração não encontrado"}), 404
    except Exception as e:
        print(f"Erro ao obter variáveis do template {template_name}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/templates/<template_name>/rename', methods=['POST'])
def rename_template(template_name):
    try:
        data = request.get_json()
        novo_nome = data.get('novo_nome')

        if not novo_nome:
            return 'Nome do template não fornecido', 400

        # Verifica se o template existe
        template_path = os.path.join(TEMPLATES_DIR, f"{template_name}.html")
        if not os.path.exists(template_path):
            return 'Template não encontrado', 404

        # Verifica se o novo nome já existe
        novo_path = os.path.join(TEMPLATES_DIR, f"{novo_nome}.html")
        if os.path.exists(novo_path):
            return 'Já existe um template com este nome', 400

        # Renomeia o arquivo do template
        os.rename(template_path, novo_path)

        # Atualiza as variáveis do template
        vars_path = os.path.join('template_configs', 'template_variables.json')
        if os.path.exists(vars_path):
            with open(vars_path, 'r', encoding='utf-8') as f:
                vars_data = json.load(f)

            if template_name in vars_data:
                vars_data[novo_nome] = vars_data.pop(template_name)

                with open(vars_path, 'w', encoding='utf-8') as f:
                    json.dump(vars_data, f, indent=4, ensure_ascii=False)

        return jsonify({'message': 'Template renomeado com sucesso'})

    except Exception as e:
        print(f"Erro ao renomear template: {str(e)}")
        return f'Erro ao renomear template: {str(e)}', 500

if __name__ == '__main__':
    app.run(debug=True)
