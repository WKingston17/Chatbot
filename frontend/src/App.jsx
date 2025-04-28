import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink, Text, Title, Button, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMessage, IconSettings, IconBook, IconHistory } from '@tabler/icons-react';

// Pages
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Resources from './pages/Resources';
import History from './pages/History';

function App() {
  const [opened, { toggle, close }] = useDisclosure();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelStatus, setModelStatus] = useState('Chargement...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si le modèle est chargé au démarrage
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'Model loaded') {
          setModelLoaded(true);
          setModelStatus(`Modèle chargé: ${data.model_path.split('/').pop()}`);
        } else {
          setModelStatus('Modèle non chargé');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la vérification du statut:', error);
        setModelStatus('Erreur de connexion au serveur');
      });
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  const links = [
    { icon: <IconMessage size={20} />, label: 'Discussion', to: '/' },
    { icon: <IconHistory size={20} />, label: 'Historique', to: '/history' },
    { icon: <IconBook size={20} />, label: 'Ressources', to: '/resources' },
    { icon: <IconSettings size={20} />, label: 'Paramètres', to: '/settings' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3} c="blue.6">TurboPech</Title>
          </Group>
          <Group>
            <Text size="sm" c={modelLoaded ? "green.6" : "red.6"} fw={500}>
              {modelStatus}
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={4} mb="md" c="dimmed">Menu</Title>
        {links.map((link) => (
          <NavLink
            key={link.to}
            component="button"
            label={link.label}
            leftSection={link.icon}
            active={link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)}
            onClick={() => navigate(link.to)}
            mb="xs"
            styles={(theme) => ({
              root: {
                fontWeight: 500,
                '&[data-active]': {
                  backgroundColor: theme.colors.blue[0],
                  color: theme.colors.blue[7],
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: theme.colors.blue[1],
                  },
                }
              }
            })}
          />
        ))}
        
        <Text size="xs" mt="xl" c="dimmed">
          Version 1.0.0
        </Text>
      </AppShell.Navbar>

      <AppShell.Main>
        <Transition
          mounted={true}
          transition="fade"
          duration={200}
          timingFunction="ease"
        >
          {(styles) => (
            <div style={styles}>
              <Routes>
                <Route path="/" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          )}
        </Transition>
      </AppShell.Main>
    </AppShell>
  );
}

export default App; 