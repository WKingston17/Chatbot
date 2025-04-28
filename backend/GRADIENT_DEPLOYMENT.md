# Guide de déploiement sur Paperspace Gradient

Ce guide explique comment déployer le backend TurboPech sur Paperspace Gradient pour utiliser un GPU A6000.

## Prérequis

- Un compte Paperspace avec un abonnement Growth
- Git installé sur votre machine locale

## Étapes de déploiement

### 1. Préparation des fichiers

Assurez-vous que tous les fichiers nécessaires sont présents dans le répertoire backend:
- `app.py` - Application FastAPI principale
- `requirements.txt` - Dépendances Python
- `Dockerfile` - Configuration Docker pour le déploiement
- `gradient_setup.sh` - Script de configuration pour Gradient
- `download_models.sh` - Script pour télécharger les modèles

### 2. Création d'un notebook Gradient

1. Connectez-vous à votre compte Paperspace Gradient: https://console.paperspace.com/
2. Accédez à "Gradient Notebooks"
3. Cliquez sur "Create Notebook"
4. Configurez votre notebook:
   - **Runtime**: Sélectionnez NVIDIA A6000 (ou votre GPU préféré)
   - **Container**: Sélectionnez PyTorch 2.1
   - **Machine Type**: Choisissez "GPU+"
   - **Workspace URL**: Vous pouvez choisir de cloner directement le repo Git

### 3. Configuration de l'environnement

Une fois le notebook lancé, ouvrez un terminal et suivez ces étapes:

```bash
# Cloner le dépôt (si vous ne l'avez pas clôné directement)
git clone <votre-repo-url>
cd <votre-repo>/backend

# Rendre les scripts exécutables
chmod +x gradient_setup.sh download_models.sh

# Télécharger les modèles (peut prendre du temps selon votre connexion)
./download_models.sh

# Installer les dépendances
pip install -r requirements.txt

# Installer llama-cpp-python avec support CUDA
pip uninstall -y llama-cpp-python
CMAKE_ARGS="-DLLAMA_CUBLAS=on" pip install llama-cpp-python
```

### 4. Lancement du serveur

Pour démarrer le serveur avec support GPU:

```bash
# Définir le nombre de couches GPU (40 est un bon point de départ pour la A6000)
export GPU_LAYERS=40

# Démarrer le serveur
uvicorn app:app --host 0.0.0.0 --port 8000
```

Le serveur sera accessible via l'URL de votre notebook avec le port 8000:
- `https://xxxxxxxx-xxxx.gradient-tenant.paperspace.io:8000`

### 5. Configuration du frontend

Modifiez le fichier `.env.production` dans le répertoire frontend:

```
VITE_API_URL=https://xxxxxxxx-xxxx.gradient-tenant.paperspace.io
```

Puis construisez et déployez votre frontend:

```bash
npm run build
```

## Optimisations

### Paramètres de performance

Pour optimiser les performances du modèle sur GPU, vous pouvez ajuster:

1. **Nombre de couches GPU**: Ajustez la variable d'environnement `GPU_LAYERS`
   - Valeur optimale: environ 40-43 pour une A6000
   - Si vous rencontrez des problèmes de VRAM, réduisez cette valeur

2. **Taille du batch**: Modifiez `n_batch` dans app.py
   - Valeurs plus élevées = inférence plus rapide mais consommation mémoire plus importante
   - Recommandé: 512-1024 pour A6000

3. **Contexte**: Modifiez `n_ctx` dans app.py
   - Définit la taille maximale de contexte (nombre de tokens)
   - Valeurs plus grandes permettent des conversations plus longues

## Redémarrage automatique (après 6h d'arrêt)

Comme mentionné, Paperspace Gradient arrête automatiquement les notebooks après 6 heures. Pour redémarrer:

1. Redémarrez manuellement le notebook depuis le tableau de bord Gradient
2. Reconnectez-vous au terminal
3. Exécutez les commandes pour redémarrer le serveur:

```bash
cd <votre-repo>/backend
export GPU_LAYERS=40
uvicorn app:app --host 0.0.0.0 --port 8000
```

## Résolution des problèmes

### Problème de mémoire GPU

Si vous voyez des erreurs liées à la mémoire GPU:

1. Réduisez le nombre de couches GPU (`GPU_LAYERS`)
2. Réduisez la taille de batch (`n_batch`)
3. Utilisez un modèle plus léger (comme la version Q4 au lieu de Q5)

### Problème de connexion

Si le frontend ne peut pas se connecter au backend:

1. Vérifiez que l'URL dans `.env.production` est correcte
2. Assurez-vous que le port 8000 est ouvert dans les paramètres du notebook
3. Vérifiez les logs du serveur pour toute erreur 