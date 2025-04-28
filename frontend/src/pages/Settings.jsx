import { useState, useEffect } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Select, 
  Loader, 
  Alert,
  Divider,
  Stack,
  Badge,
  Card,
  Progress,
  Grid,
  Slider,
  NumberInput,
  Code,
  Accordion,
  Tooltip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconInfoCircle, 
  IconCheck, 
  IconX, 
  IconCpu, 
  IconBrain, 
  IconSettings, 
  IconGauge
} from '@tabler/icons-react';
import axios from 'axios';
import { useModel } from '../contexts/ModelContext';

const Settings = () => {
  const { 
    models, 
    currentModel, 
    modelDetails, 
    loading, 
    error, 
    fetchModelInfo, 
    changeModel, 
    parameters, 
    updateParameters 
  } = useModel();
  
  const [selectedModel, setSelectedModel] = useState('');
  const [changing, setChanging] = useState(false);
  const [systemStats, setSystemStats] = useState(null);
  const [advancedOptions, setAdvancedOptions] = useState({
    n_ctx: 4096,
    n_batch: 512,
    n_gpu_layers: 0
  });

  // Charger les statistiques système
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const response = await axios.get('/api/system-stats');
        setSystemStats(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques système:', err);
      }
    };

    fetchSystemStats();
    
    // Mettre à jour les statistiques toutes les 30 secondes
    const interval = setInterval(fetchSystemStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Mettre à jour la sélection du modèle quand le modèle courant change
  useEffect(() => {
    if (currentModel) {
      setSelectedModel(currentModel);
    }
  }, [currentModel]);

  // Changer de modèle
  const handleChangeModel = async () => {
    if (!selectedModel) return;

    setChanging(true);
    try {
      const success = await changeModel(selectedModel);
      
      if (!success) {
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de changer le modèle',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    } catch (err) {
      console.error('Erreur lors du changement de modèle:', err);
    } finally {
      setChanging(false);
    }
  };

  // Changer les paramètres avancés du modèle
  const handleAdvancedModelChange = async () => {
    if (!selectedModel) return;

    setChanging(true);
    try {
      const response = await axios.post('/api/change-model', {
        model_file: selectedModel,
        n_ctx: advancedOptions.n_ctx,
        n_batch: advancedOptions.n_batch,
        n_gpu_layers: advancedOptions.n_gpu_layers
      });
      
      if (response.data.status === 'Model changed successfully') {
        notifications.show({
          title: 'Succès',
          message: `Le modèle a été changé avec les paramètres avancés`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        
        // Mettre à jour les infos du modèle
        fetchModelInfo();
      }
    } catch (err) {
      console.error('Erreur lors du changement de modèle:', err);
      
      notifications.show({
        title: 'Erreur',
        message: `Impossible de changer le modèle: ${err.message}`,
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setChanging(false);
    }
  };

  if (loading && !systemStats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Stack>
      <Paper shadow="sm" p="md">
        <Title order={3} mb="md">Paramètres du modèle</Title>
        
        {error && (
          <Alert icon={<IconInfoCircle size={16} />} title="Information" color="red" mb="md">
            {error}
          </Alert>
        )}

        <Group mb="lg">
          <div style={{ flex: 1 }}>
            <Text fw={500} mb={5}>Modèle actuel</Text>
            <Badge size="lg" variant="filled" color="blue">
              {currentModel || 'Aucun modèle chargé'}
            </Badge>
          </div>
          
          {modelDetails && modelDetails.load_time && (
            <div>
              <Text fw={500} mb={5}>Temps de chargement</Text>
              <Badge size="md" variant="light">
                {modelDetails.load_time.toFixed(2)} secondes
              </Badge>
            </div>
          )}
        </Group>

        <Divider my="md" />

        <Title order={4} mb="md">Changer de modèle</Title>
        <Group>
          <Select
            label="Sélectionner un modèle"
            placeholder="Choisir un modèle"
            data={models.map(model => ({ 
              value: model.filename, 
              label: `${model.filename} (${model.size_gb} GB)${model.is_active ? ' - Actif' : ''}` 
            }))}
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ flex: 1 }}
            searchable
            clearable
          />

          <Button 
            onClick={handleChangeModel} 
            disabled={!selectedModel || changing}
            loading={changing}
            style={{ alignSelf: 'flex-end', marginBottom: '3px' }}
          >
            Changer de modèle
          </Button>
        </Group>
      </Paper>
      
      <Paper shadow="sm" p="md">
        <Title order={3} mb="md">Statistiques du système</Title>
        
        {systemStats ? (
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder p="md">
                <Group position="apart" mb="xs">
                  <Text fw={500}><IconCpu size={16} style={{ marginRight: 5 }} /> CPU</Text>
                  <Badge>{systemStats.cpu_percent}%</Badge>
                </Group>
                <Progress 
                  value={systemStats.cpu_percent} 
                  color={systemStats.cpu_percent > 80 ? 'red' : systemStats.cpu_percent > 50 ? 'yellow' : 'blue'} 
                  size="xl" 
                  radius="xl" 
                  mb="md"
                />
                <Text size="sm" c="dimmed">Plateforme: {systemStats.platform}</Text>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Card withBorder p="md">
                <Group position="apart" mb="xs">
                  <Text fw={500}>Mémoire</Text>
                  <Badge>{systemStats.memory.percent}%</Badge>
                </Group>
                <Progress 
                  value={systemStats.memory.percent} 
                  color={systemStats.memory.percent > 80 ? 'red' : systemStats.memory.percent > 50 ? 'yellow' : 'blue'} 
                  size="xl" 
                  radius="xl" 
                  mb="md"
                />
                <Text size="sm" c="dimmed">
                  {Math.round((systemStats.memory.total - systemStats.memory.available) / 1024 / 1024 / 1024 * 100) / 100} GB / 
                  {Math.round(systemStats.memory.total / 1024 / 1024 / 1024 * 100) / 100} GB
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        ) : (
          <Text c="dimmed">Chargement des statistiques...</Text>
        )}
      </Paper>
      
      <Paper shadow="sm" p="md">
        <Title order={3} mb="md">Paramètres de génération par défaut</Title>
        
        <Grid>
          <Grid.Col span={6}>
            <Text fw={500} mb={5}>Température</Text>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={parameters.temperature}
              onChange={(value) => updateParameters({ temperature: value })}
              marks={[
                { value: 0, label: '0' },
                { value: 0.5, label: '0.5' },
                { value: 1, label: '1' }
              ]}
              mb="lg"
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text fw={500} mb={5}>Top-P</Text>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={parameters.top_p}
              onChange={(value) => updateParameters({ top_p: value })}
              marks={[
                { value: 0, label: '0' },
                { value: 0.5, label: '0.5' },
                { value: 1, label: '1' }
              ]}
              mb="lg"
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text fw={500} mb={5}>Pénalisation de fréquence</Text>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={parameters.frequency_penalty}
              onChange={(value) => updateParameters({ frequency_penalty: value })}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' }
              ]}
              mb="lg"
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text fw={500} mb={5}>Pénalisation de présence</Text>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={parameters.presence_penalty}
              onChange={(value) => updateParameters({ presence_penalty: value })}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' }
              ]}
              mb="lg"
            />
          </Grid.Col>
        </Grid>
      </Paper>
      
      <Paper shadow="sm" p="md">
        <Accordion>
          <Accordion.Item value="advanced">
            <Accordion.Control icon={<IconSettings size={20} />}>
              <Title order={4}>Options avancées du modèle</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" c="dimmed" mb="md">
                Ces options affectent les performances et la consommation mémoire du modèle. 
                Ne modifiez ces valeurs que si vous savez ce que vous faites.
              </Text>
              
              <Grid mb="md">
                <Grid.Col span={4}>
                  <NumberInput
                    label="Contexte (n_ctx)"
                    description="Taille du contexte en tokens"
                    value={advancedOptions.n_ctx}
                    onChange={(value) => setAdvancedOptions(prev => ({ ...prev, n_ctx: value }))}
                    min={512}
                    max={8192}
                    step={512}
                  />
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <NumberInput
                    label="Batch (n_batch)"
                    description="Taille du batch"
                    value={advancedOptions.n_batch}
                    onChange={(value) => setAdvancedOptions(prev => ({ ...prev, n_batch: value }))}
                    min={64}
                    max={1024}
                    step={64}
                  />
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <NumberInput
                    label="GPU Layers"
                    description="Nombre de couches sur GPU"
                    value={advancedOptions.n_gpu_layers}
                    onChange={(value) => setAdvancedOptions(prev => ({ ...prev, n_gpu_layers: value }))}
                    min={0}
                    max={100}
                  />
                </Grid.Col>
              </Grid>
              
              <Button 
                onClick={handleAdvancedModelChange} 
                disabled={!selectedModel || changing}
                loading={changing}
                leftSection={<IconBrain size={16} />}
              >
                Appliquer les paramètres avancés
              </Button>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>

      <Paper shadow="sm" p="md">
        <Title order={3} mb="md">Informations sur le modèle</Title>
        <Card withBorder p="md">
          <Text mb="xs" fw={500}>Pour de meilleures performances sur votre MacBook Pro 2020 (Intel, 16GB RAM) :</Text>
          <Text component="ul">
            <Text component="li">Utilisez des modèles 7B ou 8B quantifiés en Q4_K_M ou Q5_K_M</Text>
            <Text component="li">Les modèles recommandés incluent Llama-3-8B-Instruct et Mistral-7B-Instruct</Text>
            <Text component="li">Évitez les modèles de plus de 13B pour des performances optimales</Text>
            <Text component="li">Pour les modèles plus gros, réduisez n_ctx (2048 ou moins)</Text>
          </Text>
        </Card>
      </Paper>

      <Paper shadow="sm" p="md">
        <Title order={3} mb="md">Ajout de modèles</Title>
        <Text mb="md">
          Pour ajouter de nouveaux modèles à TurboPech :
        </Text>
        <Text component="ol">
          <Text component="li">Téléchargez des modèles GGUF depuis <a href="https://huggingface.co/TheBloke" target="_blank" rel="noopener noreferrer">HuggingFace (TheBloke)</a></Text>
          <Text component="li">Placez les fichiers .gguf dans le dossier <code>models/</code> du backend</Text>
          <Text component="li">Revenez à cette page et actualisez pour voir les nouveaux modèles</Text>
        </Text>
      </Paper>
    </Stack>
  );
};

export default Settings; 