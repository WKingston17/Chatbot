# TurboPech Backend

Backend pour l'application TurboPech, un assistant pédagogique utilisant des modèles LLM locaux pour aider les élèves du collège et du lycée.

## Prérequis

- Python 3.9+
- Modèles Llama en format GGUF

## Installation

1. Créez un environnement virtuel et activez-le :

```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. Installez les dépendances :

```bash
pip install -r requirements.txt
```

3. Préparez vos modèles :

```bash
mkdir -p models
```

4. Téléchargez un modèle Llama2 compatible au format GGUF depuis [HuggingFace](https://huggingface.co/TheBloke).
   Voici quelques modèles recommandés pour votre MacBook Pro 2020 Intel avec 16 GB RAM :
   
   - [Llama-2-7B-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF)
   - [Mistral-7B-Instruct-v0.2-GGUF](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF)
   
   Utilisez de préférence les quantifications Q4_K_M ou Q5_K_M pour un bon équilibre entre performance et qualité.

5. Placez vos modèles GGUF dans le dossier `models/`.

6. Copiez le fichier .env.example vers .env et modifiez-le selon vos besoins :

```bash
cp .env.example .env
```

## Démarrage du serveur

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /`: Vérification que l'API est en fonctionnement
- `GET /status`: Status du modèle chargé
- `POST /chat`: Endpoint principal pour interagir avec le modèle
- `GET /models`: Liste des modèles disponibles
- `POST /change-model`: Changer le modèle utilisé

## Notes pour les performances

Pour votre MacBook Pro 2020 avec Intel et 16GB de RAM :

1. Privilégiez les modèles 7B avec quantification Q4_K_M ou Q5_K_M
2. Activez le paramètre `n_gpu_layers` pour utiliser le GPU Metal si disponible
3. Ajustez `n_ctx` et `n_batch` selon les capacités de votre machine 