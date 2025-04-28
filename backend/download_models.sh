#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}        Téléchargement des modèles pour TurboPech       ${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Créer le répertoire des modèles s'il n'existe pas
mkdir -p models

# URL des modèles courants Llama
MODEL_URLS=(
  "https://huggingface.co/TheBloke/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/meta-llama-3.1-8b-instruct.Q5_K_M.gguf"
  "https://huggingface.co/TheBloke/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/meta-llama-3.1-8b-instruct.Q4_K_M.gguf"
)

MODEL_NAMES=(
  "Meta-Llama-3.1-8B-Instruct-Q5_K_M.gguf"
  "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"
)

for i in "${!MODEL_URLS[@]}"; do
  URL=${MODEL_URLS[$i]}
  NAME=${MODEL_NAMES[$i]}
  OUTPUT_PATH="models/$NAME"
  
  if [ -f "$OUTPUT_PATH" ]; then
    echo -e "${YELLOW}Le modèle $NAME existe déjà.${NC}"
    echo -e "Souhaitez-vous le télécharger à nouveau ? (y/n)"
    read -r answer
    if [[ "$answer" != "y" ]]; then
      echo -e "${GREEN}Téléchargement ignoré pour $NAME${NC}"
      continue
    fi
  fi
  
  echo -e "${GREEN}Téléchargement de $NAME...${NC}"
  echo -e "${BLUE}URL: $URL${NC}"
  
  if command -v wget &> /dev/null; then
    wget -O "$OUTPUT_PATH" "$URL"
  elif command -v curl &> /dev/null; then
    curl -L -o "$OUTPUT_PATH" "$URL"
  else
    echo -e "${RED}Erreur: ni wget ni curl n'est installé.${NC}"
    exit 1
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Téléchargement de $NAME terminé avec succès.${NC}"
  else
    echo -e "${RED}Erreur lors du téléchargement de $NAME.${NC}"
  fi
done

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}Téléchargement des modèles terminé.${NC}"
echo -e "${BLUE}=======================================================${NC}" 