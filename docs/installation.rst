Instalação
==========

Requisitos
----------

* Python 3.7 ou superior
* pip

Instalação via pip
-----------------

Para instalar o Editor de Templates de Email usando pip:

.. code-block:: bash

   pip install email-editor

Instalação a partir do código fonte
---------------------------------

1. Clone o repositório:

   .. code-block:: bash

      git clone https://github.com/seu-usuario/editor-email.git
      cd editor-email

2. Crie um ambiente virtual:

   .. code-block:: bash

      python -m venv venv
      source venv/bin/activate  # Linux/Mac
      venv\Scripts\activate     # Windows

3. Instale as dependências:

   .. code-block:: bash

      pip install -r requirements.txt

4. Copie o arquivo de configuração de exemplo:

   .. code-block:: bash

      cp .env.example .env

5. Edite o arquivo .env com suas configurações:

   .. code-block:: text

      FLASK_APP=app.py
      FLASK_ENV=development
      FLASK_DEBUG=1
      SECRET_KEY=sua-chave-secreta-aqui
      ALLOWED_HOSTS=localhost,127.0.0.1
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      SMTP_USER=seu-email@gmail.com
      SMTP_PASSWORD=sua-senha-de-app

6. Inicie o servidor:

   .. code-block:: bash

      flask run

A aplicação estará disponível em http://localhost:5000.
