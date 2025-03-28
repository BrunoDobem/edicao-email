# Editor de Email Dinâmico

Este é um editor de email que permite modificar um template HTML com variáveis dinâmicas sem alterar o código fonte.

## Requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

## Instalação

1. Clone este repositório ou baixe os arquivos
2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Estrutura do Projeto

```
.
├── config/
│   └── variables.json    # Arquivo com as variáveis do template
├── editor/
│   └── index.html       # Interface de edição
├── static/
│   ├── css/
│   │   └── editor.css   # Estilos da interface
│   ├── js/
│   │   └── editor.js    # Lógica da interface
│   └── images/          # Diretório para imagens
├── templates/
│   └── base.html        # Template base do email
├── server.py            # Servidor Flask
└── requirements.txt     # Dependências do projeto
```

## Como Usar

1. Inicie o servidor:
```bash
python server.py
```

2. Abra seu navegador e acesse:
```
http://localhost:5000
```

3. Na interface de edição, você pode:
   - Modificar textos
   - Alterar URLs de imagens
   - Atualizar links
   - Visualizar preview em tempo real
   - Salvar alterações

## Personalização

Para adicionar novas variáveis ao template:

1. Edite o arquivo `config/variables.json`
2. Adicione as novas variáveis no formato:
```json
{
    "nome_variavel": "valor_padrao"
}
```

3. No template `templates/base.html`, use a sintaxe:
```html
{{ nome_variavel }}
```

## Suporte

Se encontrar algum problema ou tiver sugestões, abra uma issue no repositório. 