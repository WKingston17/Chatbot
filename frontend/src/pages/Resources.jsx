import { 
  Title, 
  Text, 
  Paper,
  SimpleGrid,
  Card,
  Group,
  Stack,
  List,
  Accordion,
  ThemeIcon,
  Badge,
  Tabs,
  Box,
  Button,
} from '@mantine/core';
import { 
  IconBook, 
  IconMath, 
  IconLanguage, 
  IconAtom, 
  IconMapPin,
  IconBallpen, 
  IconHistory, 
  IconPencil,
  IconBulb,
  IconBrain,
  IconChevronRight,
  IconExternalLink
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import AnimatedComponent, { StaggeredAnimation } from '../components/Animation';

const ResourceCard = ({ title, description, icon, subjects }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <AnimatedComponent transition="slide-up">
      <Card shadow="sm" p="lg" radius="md" withBorder h="100%">
        <Card.Section bg="blue.0" p="md">
          <Group>
            <ThemeIcon size="lg" variant="light" color="blue">
              {icon}
            </ThemeIcon>
            <Title order={4}>{title}</Title>
          </Group>
        </Card.Section>
        
        <Text mt="md" mb="md" c="dimmed" size="sm">
          {description}
        </Text>
        
        <Accordion mt="xs">
          <Accordion.Item value="subjects">
            <Accordion.Control icon={<IconBulb size={18} />}>
              Sujets abordés
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs" icon={
                <ThemeIcon color="blue" size="xs" radius="xl">
                  <IconChevronRight size={12} />
                </ThemeIcon>
              }>
                {subjects.map((subject, index) => (
                  <List.Item key={index}>{subject}</List.Item>
                ))}
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </AnimatedComponent>
  );
};

const Resources = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement pour les animations
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const resourceCategories = [
    {
      title: "Mathématiques",
      description: "Concepts et méthodes mathématiques du collège au lycée",
      icon: <IconMath size={20} />,
      subjects: [
        "Algèbre et équations",
        "Géométrie et trigonométrie",
        "Analyse et fonctions",
        "Probabilités et statistiques"
      ]
    },
    {
      title: "Sciences Physiques",
      description: "Principes et expériences de physique et chimie",
      icon: <IconAtom size={20} />,
      subjects: [
        "Mécanique et forces",
        "Électricité et magnétisme",
        "Optique et ondes",
        "Chimie organique et minérale"
      ]
    },
    {
      title: "Français",
      description: "Langue, littérature et expression écrite",
      icon: <IconPencil size={20} />,
      subjects: [
        "Grammaire et conjugaison",
        "Littérature et mouvements littéraires",
        "Commentaire et dissertation",
        "Argumentation et persuasion"
      ]
    },
    {
      title: "Langues",
      description: "Anglais, espagnol, allemand et autres langues",
      icon: <IconLanguage size={20} />,
      subjects: [
        "Vocabulaire et expressions",
        "Grammaire et temps",
        "Compréhension orale et écrite",
        "Culture et civilisation"
      ]
    },
    {
      title: "Histoire-Géographie",
      description: "Périodes historiques et concepts géographiques",
      icon: <IconHistory size={20} />,
      subjects: [
        "Histoire ancienne et médiévale",
        "Histoire moderne et contemporaine",
        "Géographie humaine et économique",
        "Géopolitique et mondialisation"
      ]
    },
    {
      title: "SVT",
      description: "Biologie, géologie et environnement",
      icon: <IconBook size={20} />,
      subjects: [
        "Génétique et évolution",
        "Corps humain et santé",
        "Écologie et biodiversité",
        "Géologie et climatologie"
      ]
    }
  ];

  const howToUse = [
    {
      title: "Poser des questions précises",
      description: "Formulez vos questions de manière claire et spécifique pour obtenir des réponses plus pertinentes."
    },
    {
      title: "Préciser votre niveau",
      description: "Indiquez si vous êtes au collège ou au lycée pour que les explications soient adaptées."
    },
    {
      title: "Demander des exercices",
      description: "Sollicitez des exercices d'application sur un thème spécifique pour vous entraîner."
    },
    {
      title: "Obtenir des corrections",
      description: "Partagez vos réponses pour recevoir des corrections et des commentaires constructifs."
    },
    {
      title: "Réviser efficacement",
      description: "Utilisez l'assistant pour réviser avant un contrôle ou un examen avec des résumés personnalisés."
    }
  ];

  const externalResources = [
    {
      title: "Khan Academy",
      description: "Cours et exercices gratuits dans de nombreuses matières",
      url: "https://fr.khanacademy.org/"
    },
    {
      title: "Eduscol",
      description: "Ressources pédagogiques officielles de l'Éducation Nationale",
      url: "https://eduscol.education.fr/"
    },
    {
      title: "Lumni",
      description: "Contenus audiovisuels éducatifs pour tous les niveaux",
      url: "https://www.lumni.fr/"
    },
    {
      title: "Bibliothèque Nationale de France",
      description: "Ressources culturelles et littéraires en ligne",
      url: "https://www.bnf.fr/fr"
    }
  ];

  return (
    <AnimatedComponent>
      <Stack spacing="md">
        <Paper shadow="sm" p="md">
          <AnimatedComponent transition="slide-down">
            <Title order={3} mb="md">Centre de ressources</Title>
            <Text mb="lg" size="sm" c="dimmed">
              TurboPech peut vous aider dans de nombreuses matières scolaires. Explorez les catégories 
              ci-dessous pour découvrir comment l'assistant peut vous accompagner dans vos études.
            </Text>
          </AnimatedComponent>

          <Tabs value={activeTab} onChange={setActiveTab} mb="md">
            <Tabs.List>
              <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>
                Matières
              </Tabs.Tab>
              <Tabs.Tab value="howto" leftSection={<IconBulb size={16} />}>
                Guide d'utilisation
              </Tabs.Tab>
              <Tabs.Tab value="external" leftSection={<IconExternalLink size={16} />}>
                Ressources externes
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Box py="md">
            {activeTab === 'subjects' && (
              <StaggeredAnimation
                items={resourceCategories}
                renderItem={(category, index) => (
                  <ResourceCard 
                    key={index} 
                    title={category.title} 
                    description={category.description} 
                    icon={category.icon}
                    subjects={category.subjects}
                  />
                )}
                staggerDelay={100}
              >
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                  {resourceCategories.map((category, index) => (
                    <ResourceCard 
                      key={index} 
                      title={category.title} 
                      description={category.description} 
                      icon={category.icon}
                      subjects={category.subjects}
                    />
                  ))}
                </SimpleGrid>
              </StaggeredAnimation>
            )}

            {activeTab === 'howto' && (
              <AnimatedComponent transition="fade">
                <Paper p="md" withBorder radius="md">
                  <Title order={4} mb="md">Comment utiliser l'assistant efficacement</Title>
                  
                  <Accordion multiple variant="separated">
                    {howToUse.map((tip, index) => (
                      <Accordion.Item value={`tip-${index}`} key={index}>
                        <Accordion.Control>
                          <Group>
                            <Text fw={500}>{tip.title}</Text>
                            <Badge size="sm" variant="outline" color="blue">Conseil {index + 1}</Badge>
                          </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Text size="sm">{tip.description}</Text>
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Paper>
              </AnimatedComponent>
            )}

            {activeTab === 'external' && (
              <AnimatedComponent transition="fade">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {externalResources.map((resource, index) => (
                    <Card key={index} withBorder radius="md" p="md">
                      <Group position="apart">
                        <Text fw={500}>{resource.title}</Text>
                        <ThemeIcon radius="xl" size="sm" variant="light" color="blue">
                          <IconExternalLink size={14} />
                        </ThemeIcon>
                      </Group>
                      <Text size="sm" c="dimmed" mt="xs" mb="md">{resource.description}</Text>
                      <Button 
                        component="a" 
                        href={resource.url} 
                        target="_blank" 
                        variant="light" 
                        fullWidth
                        rightSection={<IconExternalLink size={16} />}
                      >
                        Visiter
                      </Button>
                    </Card>
                  ))}
                </SimpleGrid>
              </AnimatedComponent>
            )}
          </Box>
        </Paper>
      </Stack>
    </AnimatedComponent>
  );
};

export default Resources; 