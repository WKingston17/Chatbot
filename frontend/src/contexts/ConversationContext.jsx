import { createContext, useContext, useState, useEffect } from 'react';

const ConversationContext = createContext();

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState({ messages: [], title: 'Nouvelle conversation' });

  // Charger les conversations depuis le localStorage au démarrage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      try {
        setConversations(JSON.parse(savedConversations));
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
      }
    }
  }, []);

  // Sauvegarder les conversations dans le localStorage lorsqu'elles changent
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Créer une nouvelle conversation
  const createConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      date: new Date(),
      messages: [],
      modelInfo: {}
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    setCurrentConversation(newConversation);
    
    return newConversation;
  };

  // Mettre à jour le titre d'une conversation
  const updateConversationTitle = (id, title) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === id ? { ...conv, title } : conv
    );
    setConversations(updatedConversations);
    
    if (currentConversationId === id) {
      setCurrentConversation(prev => ({ ...prev, title }));
    }
  };

  // Ajouter un message à la conversation courante
  const addMessage = (message) => {
    // Si aucune conversation active, en créer une nouvelle
    if (!currentConversationId) {
      const newConv = createConversation();
      const updatedConversation = { ...newConv, messages: [...newConv.messages, message] };
      
      setCurrentConversation(updatedConversation);
      setConversations(conversations.map(conv => 
        conv.id === newConv.id ? updatedConversation : conv
      ));
      
      return;
    }
    
    // Sinon, ajouter à la conversation existante
    const updatedConversation = { ...currentConversation, messages: [...currentConversation.messages, message] };
    setCurrentConversation(updatedConversation);
    
    setConversations(conversations.map(conv => 
      conv.id === currentConversationId ? updatedConversation : conv
    ));
    
    // Mettre à jour automatiquement le titre si c'est le premier message de l'utilisateur
    if (message.role === 'user' && currentConversation.messages.length === 0) {
      // Limiter le titre à 50 caractères
      const title = message.content.length > 50 
        ? message.content.substring(0, 47) + '...' 
        : message.content;
      
      updateConversationTitle(currentConversationId, title);
    }
  };

  // Charger une conversation existante
  const loadConversation = (id) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setCurrentConversation(conversation);
      return conversation;
    }
    return null;
  };

  // Supprimer une conversation
  const deleteConversation = (id) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    
    // Si c'était la conversation active, réinitialiser
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setCurrentConversation({ messages: [], title: 'Nouvelle conversation' });
    }
  };

  // Exporter une conversation au format texte
  const exportConversation = (id) => {
    const conversation = conversations.find(conv => conv.id === id) || currentConversation;
    
    let exportText = `# ${conversation.title}\n`;
    exportText += `Date: ${new Date(conversation.date).toLocaleString()}\n\n`;
    
    conversation.messages.forEach(msg => {
      const role = msg.role === 'user' ? 'Vous' : 'Assistant';
      exportText += `## ${role}\n\n${msg.content}\n\n`;
    });
    
    return exportText;
  };

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        currentConversationId,
        createConversation,
        addMessage,
        loadConversation,
        deleteConversation,
        updateConversationTitle,
        exportConversation
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}; 