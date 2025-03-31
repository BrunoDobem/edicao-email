# Editor de Templates de Email

Este é um editor de templates de email desenvolvido em Python usando Flask. Ele permite criar, editar e gerenciar templates de email de forma simples e intuitiva.

## Funcionalidades

- Criação e edição de templates de email
- Preview em tempo real
- Suporte a variáveis dinâmicas
- Gerenciamento de múltiplos templates
- Interface responsiva
- Exportação do código HTML

## Requisitos

- Python 3.7 ou superior
- Flask
- Navegador web moderno

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/editor-email.git
cd editor-email
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Execute o servidor:
```bash
python app.py
```

4. Acesse o editor no navegador:
```
http://localhost:5000
```

## Estrutura do Projeto

```
editor-email/
├── app.py              # Servidor Flask
├── requirements.txt    # Dependências do projeto
├── static/            # Arquivos estáticos
│   ├── css/          # Estilos CSS
│   └── js/           # Scripts JavaScript
├── templates/         # Templates HTML
│   └── default.html  # Template padrão
├── variables.json    # Variáveis do template
└── config.json       # Configurações do sistema
```

## Uso

1. Acesse a página inicial
2. Selecione um template existente ou crie um novo
3. Edite as variáveis do template
4. Use o botão "Preview" para visualizar o resultado
5. Use o botão "Salvar" para salvar as alterações
6. Use o botão "Ver Código" para ver o HTML gerado

## Variáveis do Template

O sistema suporta as seguintes variáveis no template:

- `{{titulo}}` - Título do email
- `{{nome}}` - Nome do destinatário
- `{{mensagem}}` - Conteúdo principal
- `{{botao.texto}}` - Texto do botão (opcional)
- `{{botao.url}}` - URL do botão (opcional)
- `{{rodape}}` - Texto do rodapé

## Contribuição

Contribuições são bem-vindas! Por favor, siga estas etapas:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes. 