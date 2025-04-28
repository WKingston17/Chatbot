#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}        Configuration TurboPech sur Gradient           ${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Installer les dépendances
echo -e "${GREEN}Installation des dépendances...${NC}"
pip install -r requirements.txt

# Configuration CORS pour accepter les requêtes externes
echo -e "${GREEN}Configuration pour accepter les connections externes...${NC}"
PORT=${PORT:-8000}

echo -e "${GREEN}Le backend sera accessible sur le port $PORT${NC}"
echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}Exécutez la commande suivante pour démarrer l'API:${NC}"
echo -e "${YELLOW}uvicorn app:app --host 0.0.0.0 --port $PORT${NC}"
echo -e "${BLUE}=======================================================${NC}" 