API
===

Endpoints
--------

Templates
~~~~~~~~

.. http:get:: /api/templates

   Retorna a lista de todos os templates disponíveis.

   **Resposta**

   .. sourcecode:: json

      {
        "templates": [
          {
            "id": "string",
            "name": "string",
            "description": "string",
            "created_at": "string",
            "updated_at": "string"
          }
        ]
      }

.. http:get:: /api/templates/{template_id}

   Retorna os detalhes de um template específico.

   **Parâmetros**

   * template_id (string) - ID do template

   **Resposta**

   .. sourcecode:: json

      {
        "id": "string",
        "name": "string",
        "description": "string",
        "content": "string",
        "variables": {},
        "created_at": "string",
        "updated_at": "string"
      }

.. http:post:: /api/templates

   Cria um novo template.

   **Corpo da Requisição**

   .. sourcecode:: json

      {
        "name": "string",
        "description": "string",
        "content": "string",
        "variables": {}
      }

   **Resposta**

   .. sourcecode:: json

      {
        "id": "string",
        "name": "string",
        "description": "string",
        "content": "string",
        "variables": {},
        "created_at": "string",
        "updated_at": "string"
      }

.. http:put:: /api/templates/{template_id}

   Atualiza um template existente.

   **Parâmetros**

   * template_id (string) - ID do template

   **Corpo da Requisição**

   .. sourcecode:: json

      {
        "name": "string",
        "description": "string",
        "content": "string",
        "variables": {}
      }

   **Resposta**

   .. sourcecode:: json

      {
        "id": "string",
        "name": "string",
        "description": "string",
        "content": "string",
        "variables": {},
        "created_at": "string",
        "updated_at": "string"
      }

.. http:delete:: /api/templates/{template_id}

   Remove um template.

   **Parâmetros**

   * template_id (string) - ID do template

   **Resposta**

   .. sourcecode:: json

      {
        "message": "Template removido com sucesso"
      }

Configurações
~~~~~~~~~~~

.. http:get:: /api/config

   Retorna as configurações atuais do sistema.

   **Resposta**

   .. sourcecode:: json

      {
        "default_template": "string",
        "preview_scale": "number",
        "variables": {}
      }

.. http:put:: /api/config

   Atualiza as configurações do sistema.

   **Corpo da Requisição**

   .. sourcecode:: json

      {
        "default_template": "string",
        "preview_scale": "number",
        "variables": {}
      }

   **Resposta**

   .. sourcecode:: json

      {
        "message": "Configurações atualizadas com sucesso"
      }

Autenticação
----------

Todas as requisições à API devem incluir um token de autenticação no cabeçalho:

.. sourcecode:: http

   Authorization: Bearer <token>

Códigos de Status
--------------

* 200: Sucesso
* 201: Criado
* 400: Requisição inválida
* 401: Não autorizado
* 403: Proibido
* 404: Não encontrado
* 500: Erro interno do servidor

Exemplos de Uso
-------------

Usando Python com requests:

.. sourcecode:: python

   import requests

   # Configurar o token de autenticação
   headers = {
       'Authorization': 'Bearer seu-token-aqui'
   }

   # Listar templates
   response = requests.get('http://localhost:5000/api/templates', headers=headers)
   templates = response.json()

   # Criar novo template
   new_template = {
       'name': 'Novo Template',
       'description': 'Descrição do template',
       'content': '<html>...</html>',
       'variables': {}
   }
   response = requests.post('http://localhost:5000/api/templates',
                          json=new_template,
                          headers=headers)
   created_template = response.json()

   # Atualizar template
   template_id = 'id-do-template'
   updated_template = {
       'name': 'Template Atualizado',
       'description': 'Nova descrição',
       'content': '<html>...</html>',
       'variables': {}
   }
   response = requests.put(f'http://localhost:5000/api/templates/{template_id}',
                         json=updated_template,
                         headers=headers)
   updated = response.json()

   # Remover template
   response = requests.delete(f'http://localhost:5000/api/templates/{template_id}',
                            headers=headers)
   result = response.json()
