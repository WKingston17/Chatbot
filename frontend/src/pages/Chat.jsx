import { useState, useRef, useEffect } from 'react';
import { 
  TextInput, 
  Button, 
  Paper, 
  Text, 
  ScrollArea, 
  Loader,
  Title,
  Box,
  Group,
  Select,
  Textarea,
  Badge,
  ActionIcon,
  Tooltip,
  Transition
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSend, IconRobot, IconUser, IconDownload, IconClock, IconTemperature, IconWand, IconRefresh } from '@tabler/icons-react';
import axios from 'axios';
import { useConversation } from '../contexts/ConversationContext';
import { useModel } from '../contexts/ModelContext';

// Composant pour afficher un message
const Message = ({ content, role }) => {
  return (
    <Transition mounted={true} transition="fade" duration={200}>
      {(styles) => (
        <div className={`chat-message ${role === 'user' ? 'user-message' : 'bot-message'}`} style={styles}>
          <Group gap="xs" align="flex-start">
            {role === 'user' ? (
              <IconUser size={20} style={{ marginTop: 4 }} color="#1890FF" />
            ) : (
              <IconRobot size={20} style={{ marginTop: 4 }} color="#1890FF" />
            )}
            <Text className="markdown-content">{content}</Text>
          </Group>
        </div>
      )}
    </Transition>
  );
};

// Composant pour l'indicateur de frappe
const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );
};

const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const viewport = useRef(null);

  // Utiliser les contextes
  const { 
    currentConversation, 
    addMessage,
    createConversation,
    exportConversation
  } = useConversation();
  
  const {
    parameters,
    updateParameters,
    currentModel,
    getTonePrompt
  } = useModel();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentConversation.messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Préparer le message utilisateur
    const userContent = input.trim();
    const userMessage = { role: 'user', content: userContent };
    
    // Ajouter le message utilisateur
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Appliquer le ton choisi au message
      const tonePrompt = getTonePrompt();
      const messageWithTone = tonePrompt ? { ...userMessage, content: tonePrompt + userContent } : userMessage;
      
      // Préparer les messages pour l'API
      const messages = currentConversation.messages.length > 0 
        ? [...currentConversation.messages, messageWithTone].map(msg => ({ role: msg.role, content: msg.content }))
        : [messageWithTone].map(msg => ({ role: msg.role, content: msg.content }));
      
      // Appel API avec tous les paramètres
      const response = await axios.post('/api/chat', {
        messages: messages,
        temperature: parameters.temperature,
        max_tokens: parameters.max_tokens,
        top_p: parameters.top_p,
        frequency_penalty: parameters.frequency_penalty,
        presence_penalty: parameters.presence_penalty,
        stream: false
      });
      
      // Récupération de la réponse complète
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const assistantMessage = response.data.choices[0].message.content;
        
        // Ajouter la réponse de l'assistant
        addMessage({ role: 'assistant', content: assistantMessage });
        
        // Afficher le temps d'exécution si disponible
        if (response.data.stats && response.data.stats.response_time) {
          setResponseTime(response.data.stats.response_time);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      notifications.show({
        title: 'Erreur',
        message: `Erreur lors de l'envoi du message: ${error.message}`,
        color: 'red',
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    createConversation();
    setResponseTime(null);
  };

  const handleExportCurrentChat = () => {
    // Exporter la conversation courante
    try {
      const text = exportConversation(currentConversation.id);
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      
      notifications.show({
        title: 'Succès',
        message: 'Conversation exportée avec succès',
        color: 'green',
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible d\'exporter la conversation',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Paper shadow="sm" p="md" mb="md">
        <Group justify="space-between">
          <Title order={4}>Options de génération</Title>
          {currentModel && (
            <Badge size="lg" color="blue" variant="filled">
              Modèle: {currentModel}
            </Badge>
          )}
        </Group>
        
        <Group mb="md">
          <Select
            label="Température"
            description="Contrôle la créativité"
            value={parameters.temperature.toString()}
            onChange={(value) => updateParameters({ temperature: parseFloat(value) })}
            data={[
              { value: '0.3', label: '0.3 - Plus précis' },
              { value: '0.5', label: '0.5 - Équilibré' },
              { value: '0.7', label: '0.7 - Recommandé' },
              { value: '0.9', label: '0.9 - Plus créatif' },
            ]}
            style={{ flex: 1 }}
            leftSection={<IconTemperature size={14} />}
          />
          <Select
            label="Longueur maximale"
            description="Nombre max de tokens"
            value={parameters.max_tokens.toString()}
            onChange={(value) => updateParameters({ max_tokens: parseInt(value) })}
            data={[
              { value: '500', label: '500 - Court' },
              { value: '1000', label: '1000 - Moyen' },
              { value: '2000', label: '2000 - Long' },
              { value: '4000', label: '4000 - Très long' },
            ]}
            style={{ flex: 1 }}
          />
          <Select
            label="Ton de la réponse"
            description="Style de l'assistant"
            value={parameters.tone}
            onChange={(value) => updateParameters({ tone: value })}
            data={[
              { value: 'default', label: 'Standard' },
              { value: 'teacher', label: 'Professeur' },
              { value: 'simple', label: 'Simplifié' },
              { value: 'detailed', label: 'Détaillé' },
            ]}
            style={{ flex: 1 }}
            leftSection={<IconWand size={14} />}
          />
        </Group>
        
        <Group>
          <Button
            variant="outline"
            color="red"
            onClick={clearChat}
          >
            Nouvelle conversation
          </Button>
          <Button
            variant="outline"
            color="blue"
            onClick={handleExportCurrentChat}
            leftSection={<IconDownload size={16} />}
            disabled={!currentConversation.messages.length}
          >
            Exporter
          </Button>
        </Group>
      </Paper>

      <Paper shadow="sm" p="md" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <ScrollArea
          style={{ flex: 1, minHeight: '400px', maxHeight: 'calc(100vh - 350px)' }}
          viewportRef={viewport}
          offsetScrollbars
        >
          {currentConversation.messages.length === 0 ? (
            <Box p="xl" ta="center">
              <IconRobot size={48} color="#1890FF" style={{ opacity: 0.7 }} />
              <Title order={3} mt="md" c="dimmed">Démarrez une conversation</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Posez une question à TurboPech pour commencer la discussion
              </Text>
            </Box>
          ) : (
            <Box p="md">
              {currentConversation.messages.map((message, index) => (
                <Message key={index} content={message.content} role={message.role} />
              ))}
              {isLoading && (
                <Box p="xs" mt="md">
                  <Group>
                    <IconRobot size={20} color="#1890FF" />
                    <TypingIndicator />
                  </Group>
                </Box>
              )}
            </Box>
          )}
        </ScrollArea>

        <Box mt="md">
          {responseTime && (
            <Group spacing="xs" mb="xs">
              <IconClock size={14} color="gray" />
              <Text size="xs" color="dimmed">
                Réponse générée en {responseTime.toFixed(2)} secondes
              </Text>
            </Group>
          )}
          
          <Group align="flex-start">
            <Textarea
              placeholder="Posez votre question ici..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autosize
              minRows={1}
              maxRows={5}
              style={{ flex: 1 }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              variant="filled"
              style={{ alignSelf: 'flex-end' }}
              leftSection={isLoading ? <Loader size="xs" /> : <IconSend size={16} />}
            >
              Envoyer
            </Button>
          </Group>
        </Box>
      </Paper>
    </>
  );
};

export default Chat; 