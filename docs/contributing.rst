Contribuindo
===========

Obrigado pelo seu interesse em contribuir com o Editor de Templates de Email! Este documento fornece diretrizes e instruções para contribuir com o projeto.

Como Contribuir
-------------

1. Fork o repositório
2. Clone seu fork localmente
3. Configure o ambiente de desenvolvimento
4. Crie uma branch para sua feature
5. Faça suas alterações
6. Execute os testes
7. Envie um Pull Request

Configuração Inicial
-----------------

1. Fork o repositório no GitHub
2. Clone seu fork:

   .. code-block:: bash

      git clone https://github.com/seu-usuario/editor-email.git
      cd editor-email

3. Configure o repositório remoto:

   .. code-block:: bash

      git remote add upstream https://github.com/original/editor-email.git

4. Configure o ambiente de desenvolvimento:

   .. code-block:: bash

      python -m venv venv
      source venv/bin/activate  # Linux/Mac
      venv\Scripts\activate     # Windows
      pip install -r requirements-dev.txt
      pre-commit install

Fluxo de Trabalho
--------------

1. Atualize sua branch principal:

   .. code-block:: bash

      git checkout main
      git pull upstream main

2. Crie uma nova branch:

   .. code-block:: bash

      git checkout -b feature/nome-da-feature

3. Faça suas alterações e commits:

   .. code-block:: bash

      git add .
      git commit -m "Descrição clara das alterações"

4. Mantenha sua branch atualizada:

   .. code-block:: bash

      git checkout main
      git pull upstream main
      git checkout feature/nome-da-feature
      git rebase main

5. Envie suas alterações:

   .. code-block:: bash

      git push origin feature/nome-da-feature

6. Crie um Pull Request no GitHub

Diretrizes de Código
-----------------

* Siga o PEP 8 para estilo de código
* Use docstrings para documentar funções e classes
* Escreva testes unitários para novas funcionalidades
* Mantenha o código organizado e modular
* Use type hints para melhor documentação
* Mantenha as alterações focadas e atômicas

Mensagens de Commit
----------------

Use o seguinte formato para mensagens de commit:

::

   tipo(escopo): descrição

   [corpo opcional]

   [rodapé opcional]

Tipos de commit:

* feat: Nova feature
* fix: Correção de bug
* docs: Alterações na documentação
* style: Alterações de estilo (formatação, espaços, etc)
* refactor: Refatoração de código
* test: Adição ou modificação de testes
* chore: Tarefas de manutenção

Exemplo:

::

   feat(editor): adiciona suporte a templates personalizados

   - Adiciona interface para criar templates
   - Implementa validação de templates
   - Adiciona testes unitários

   Closes #123

Testes
-----

* Escreva testes para novas funcionalidades
* Mantenha a cobertura de testes acima de 80%
* Execute todos os testes antes de enviar PR:

  .. code-block:: bash

     pytest
     pytest --cov=app tests/

Documentação
----------

* Atualize a documentação para novas funcionalidades
* Mantenha os exemplos atualizados
* Verifique se a documentação está clara e completa
* Gere a documentação localmente:

  .. code-block:: bash

     cd docs
     make html

Revisão de Código
--------------

* Responda aos comentários da revisão
* Faça as alterações solicitadas
* Mantenha a discussão construtiva
* Seja paciente e respeitoso

Problemas (Issues)
--------------

* Use o template de issue apropriado
* Forneça informações detalhadas
* Inclua passos para reproduzir
* Adicione screenshots quando relevante
* Use labels apropriados

Pull Requests
-----------

* Use o template de PR
* Descreva as alterações em detalhes
* Liste as issues relacionadas
* Inclua screenshots para mudanças visuais
* Mantenha os PRs pequenos e focados

Comunicação
--------

* Seja profissional e respeitoso
* Use português claro e objetivo
* Responda em tempo hábil
* Mantenha a discussão construtiva
* Evite linguagem ofensiva

Licença
-----

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

Suporte
-----

Se precisar de ajuda:

* Abra uma issue
* Consulte a documentação
* Entre em contato com os mantenedores
* Participe das discussões

Obrigado por contribuir!
