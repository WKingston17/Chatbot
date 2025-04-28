#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}        Construction du frontend pour production        ${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Vérifier si .env.production existe
if [ ! -f .env.production ]; then
  echo -e "${RED}Erreur: Le fichier .env.production n'existe pas.${NC}"
  echo -e "${YELLOW}Veuillez créer ce fichier avec l'URL de votre backend Paperspace:${NC}"
  echo -e "VITE_API_URL=https://votre-url-paperspace.gradientapp.com"
  exit 1
fi

# Vérifier si l'URL du backend est configurée
API_URL=$(grep VITE_API_URL .env.production | cut -d '=' -f2)
if [[ "$API_URL" == "https://your-paperspace-url.gradientapp.com" || -z "$API_URL" ]]; then
  echo -e "${RED}Erreur: L'URL du backend n'est pas configurée correctement dans .env.production.${NC}"
  echo -e "${YELLOW}Veuillez modifier le fichier .env.production avec l'URL correcte de votre backend Paperspace.${NC}"
  exit 1
fi

echo -e "${GREEN}Construction du frontend pour production avec l'URL backend: ${YELLOW}$API_URL${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installation des dépendances...${NC}"
  npm install
fi

# Construire l'application
echo -e "${GREEN}Construction de l'application...${NC}"
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Construction terminée avec succès!${NC}"
  echo -e "${BLUE}=======================================================${NC}"
  echo -e "${YELLOW}Les fichiers de production se trouvent dans le répertoire 'dist'.${NC}"
  echo -e "${YELLOW}Vous pouvez déployer ces fichiers sur votre serveur web.${NC}"
  echo -e "${BLUE}=======================================================${NC}"
else
  echo -e "${RED}Erreur lors de la construction.${NC}"
  exit 1
fi 