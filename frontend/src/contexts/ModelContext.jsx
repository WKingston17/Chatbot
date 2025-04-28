import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

const ModelContext = createContext();

export const useModel = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState(null);
  const [modelDetails, setModelDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paramètres par défaut pour la génération
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
    tone: 'default' // Options: 'default', 'teacher', 'simple', 'detailed'
  });

  // Charger les infos du modèle au démarrage
  useEffect(() => {
    fetchModelInfo();
  }, []);

  // Fonction pour récupérer les informations sur le modèle actuel et la liste des modèles
  const fetchModelInfo = async () => {
    setLoading(true);
    try {
      // Récupérer le statut du modèle actuel
      const statusResponse = await axios.get('/api/status');
      if (statusResponse.data.status === 'Model loaded') {
        const modelPath = statusResponse.data.model_path;
        const modelName = modelPath.split('/').pop();
        setCurrentModel(modelName);
        setModelDetails(statusResponse.data);
      }

      // Récupérer la liste des modèles disponibles
      const modelsResponse = await axios.get('/api/models');
      if (modelsResponse.data.models && modelsResponse.data.models.length > 0) {
        setModels(modelsResponse.data.models);
        setError(null);
      } else {
        setError('Aucun modèle trouvé. Veuillez ajouter des modèles dans le répertoire "models".');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des informations du modèle:', err);
      setError('Erreur de connexion au serveur. Veuillez vérifier que le backend est en cours d\'exécution.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer de modèle
  const changeModel = async (modelFile) => {
    if (!modelFile) return false;

    try {
      setLoading(true);
      const response = await axios.post(`/api/change-model?model_file=${modelFile}`);
      
      if (response.data.status === 'Model changed successfully') {
        setCurrentModel(modelFile);
        setModelDetails(response.data);
        
        notifications.show({
          title: 'Modèle chargé',
          message: `Le modèle a été changé pour ${modelFile}`,
          color: 'green',
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors du changement de modèle:', err);
      
      notifications.show({
        title: 'Erreur',
        message: `Impossible de changer le modèle: ${err.message}`,
        color: 'red',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les paramètres du modèle
  const updateParameters = (newParams) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  };

  // Tones prédéfinis pour les prompts
  const tonePrompts = {
    default: "",
    teacher: "Réponds comme un professeur pédagogue: ",
    simple: "Explique de façon très simple, comme à un enfant de 10 ans: ",
    detailed: "Fournis une explication détaillée et approfondie: "
  };

  // Obtenir le prompt de ton à ajouter au message utilisateur
  const getTonePrompt = () => {
    return tonePrompts[parameters.tone] || "";
  };

  return (
    <ModelContext.Provider
      value={{
        models,
        currentModel,
        modelDetails,
        parameters,
        loading,
        error,
        fetchModelInfo,
        changeModel,
        updateParameters,
        getTonePrompt
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}; 