import { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Paper, 
  Stack, 
  Card, 
  Group, 
  Button, 
  Badge,
  ActionIcon,
  Modal,
  Tooltip,
  Menu,
  TextInput,
  Box,
  Skeleton,
  Transition,
  Alert,
  Pagination
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { 
  IconClock, 
  IconTrash, 
  IconMessage, 
  IconDownload, 
  IconDotsVertical, 
  IconEdit, 
  IconSearch,
  IconInfoCircle,
  IconArchive
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useConversation } from '../contexts/ConversationContext';

// Composant pour une carte de conversation
const ConversationCard = ({ conversation, onView, onDelete, onExport }) => {
  const formattedDate = new Date(conversation.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const truncatedTitle = conversation.title.length > 50 
    ? conversation.title.substring(0, 47) + '...' 
    : conversation.title;

  return (
    <Transition mounted={true} transition="fade" duration={300}>
      {(styles) => (
        <Card shadow="sm" p="md" radius="md" withBorder mb="md" style={{ ...styles }}>
          <Group position="apart" mb="xs">
            <Text fw={500} lineClamp={1} title={conversation.title}>{truncatedTitle}</Text>
            <Group gap={8}>
              <Badge color="blue" variant="light">
                <Group gap={4}>
                  <IconMessage size={14} />
                  <Text>{conversation.messages.length} messages</Text>
                </Group>
              </Badge>
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    leftSection={<IconDownload size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(conversation.id);
                    }}
                  >
                    Exporter
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conversation.id);
                    }}
                  >
                    Supprimer
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>

          <Text size="sm" c="dimmed" mb="md">
            <IconClock size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            {formattedDate}
          </Text>

          {conversation.messages.length > 0 && (
            <Text size="sm" lineClamp={2} mb="md" c="dimmed">
              {conversation.messages[0].content}
            </Text>
          )}

          <Button variant="light" fullWidth onClick={() => onView(conversation.id)}>
            Voir la conversation
          </Button>
        </Card>
      )}
    </Transition>
  );
};

const History = () => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  const { 
    conversations, 
    loadConversation, 
    deleteConversation, 
    exportConversation 
  } = useConversation();

  // Gérer le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Filtrer les conversations en fonction de la recherche
  useEffect(() => {
    const filtered = conversations.filter(conversation => {
      const titleMatch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = conversation.messages.some(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return titleMatch || contentMatch;
    });

    // Trier les conversations par date (les plus récentes en premier)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredConversations(sorted);
    setActivePage(1); // Réinitialiser la pagination lors d'une nouvelle recherche
  }, [searchQuery, conversations]);

  // Pagination
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleViewConversation = (id) => {
    loadConversation(id);
    navigate('/');
    notifications.show({
      title: 'Conversation chargée',
      message: 'La conversation a été chargée avec succès',
      color: 'blue',
    });
  };
  
  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteConversation(deletingId);
      setDeletingId(null);
      close();
      notifications.show({
        title: 'Conversation supprimée',
        message: 'La conversation a été supprimée avec succès',
        color: 'green',
      });
    }
  };
  
  const handleExportConversation = (id) => {
    try {
      const text = exportConversation(id);
      
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
    <Stack spacing="md">
      <Paper shadow="sm" p="md">
        <Group mb="md" position="apart">
          <Title order={3}>Historique des conversations</Title>
          <Badge color="blue" size="lg">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </Badge>
        </Group>

        <TextInput
          placeholder="Rechercher dans l'historique..."
          icon={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb="lg"
        />
        
        {isLoading ? (
          <Stack>
            {Array(3).fill(0).map((_, idx) => (
              <Card shadow="sm" p="md" radius="md" withBorder mb="md" key={idx}>
                <Skeleton height={20} width="60%" mb="xs" />
                <Skeleton height={15} width="30%" mb="xs" />
                <Skeleton height={40} mt="md" />
              </Card>
            ))}
          </Stack>
        ) : paginatedConversations.length > 0 ? (
          <>
            {paginatedConversations.map(conversation => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onView={handleViewConversation}
                onDelete={(id) => {
                  setDeletingId(id);
                  open();
                }}
                onExport={handleExportConversation}
              />
            ))}
            
            {totalPages > 1 && (
              <Group position="center" mt="md">
                <Pagination 
                  total={totalPages} 
                  value={activePage} 
                  onChange={setActivePage}
                  withEdges
                />
              </Group>
            )}
          </>
        ) : searchQuery ? (
          <Alert icon={<IconInfoCircle size={16} />} title="Aucun résultat" color="blue">
            Aucune conversation ne correspond à votre recherche "{searchQuery}".
          </Alert>
        ) : (
          <Alert icon={<IconArchive size={16} />} title="Historique vide" color="gray">
            Vous n'avez pas encore de conversations enregistrées. Commencez une conversation depuis l'onglet Discussion.
          </Alert>
        )}
      </Paper>
      
      <Modal 
        opened={opened} 
        onClose={close}
        title="Confirmer la suppression"
        centered
      >
        <Text mb="xl">Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.</Text>
        <Group position="right">
          <Button variant="outline" onClick={close}>Annuler</Button>
          <Button color="red" onClick={handleDeleteConfirm}>Supprimer</Button>
        </Group>
      </Modal>
    </Stack>
  );
};

export default History; 