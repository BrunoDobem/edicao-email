# Use uma imagem base Python 3.9
FROM python:3.9-slim

# Defina variáveis de ambiente
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Crie e defina o diretório de trabalho
WORKDIR /app

# Instale as dependências do sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copie os arquivos de requisitos
COPY requirements.txt .

# Instale as dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie o código da aplicação
COPY . .

# Crie um usuário não-root
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Exponha a porta
EXPOSE 5000

# Comando para executar a aplicação
CMD ["python", "app.py"]
