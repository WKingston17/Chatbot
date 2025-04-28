FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Définir des variables d'environnement
ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/root/miniconda3/bin:${PATH}"
ENV GPU_LAYERS=40
ENV PORT=8000

# Installer les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    git \
    cmake \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Installer Miniconda
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /tmp/miniconda.sh && \
    bash /tmp/miniconda.sh -b -p /root/miniconda3 && \
    rm /tmp/miniconda.sh

# Créer un environnement Conda
RUN conda create -y -n turbopech python=3.10
ENV PATH /root/miniconda3/envs/turbopech/bin:$PATH
SHELL ["conda", "run", "-n", "turbopech", "/bin/bash", "-c"]

# Installer les dépendances Python avec pip
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Activer CUDA pour llama-cpp-python
RUN pip uninstall -y llama-cpp-python && \
    CMAKE_ARGS="-DLLAMA_CUBLAS=on" pip install --no-cache-dir llama-cpp-python

# Créer le répertoire pour les modèles
RUN mkdir -p /app/models

# Copier le code de l'application
COPY . /app/

# Exposer le port
EXPOSE $PORT

# Script d'entrée
RUN chmod +x gradient_setup.sh
CMD ["conda", "run", "--no-capture-output", "-n", "turbopech", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"] 