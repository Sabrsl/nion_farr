import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Grid,
  GridItem,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  List,
  ListItem,
  ListIcon,
  Button,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronRightIcon, CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { WebVitalMetric, ResourceMetric, PageLoadMetrics } from '../utils/performance/types';
import { getStoredWebVitals, getRating } from '../utils/performance/webVitals';
import { getWebVitalsScore, getRatingFromScore, getFeedbackFromScore } from '../utils/performance/performanceScore';
import { getPageLoadMetrics } from '../utils/performance/pageLoadMonitor';
import { getResourceMetrics, generateOptimizationTips } from '../utils/performance/resourceMonitor';

interface PerformanceReportProps {
  pageUrl?: string;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ pageUrl }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Récupération des données de performance
  const webVitals = getStoredWebVitals() || [];
  const pageLoadMetrics = pageUrl 
    ? getPageLoadMetrics().find(m => m.pathname === pageUrl) 
    : getPageLoadMetrics()[0] || null;
  const resourceMetrics = pageUrl 
    ? getResourceMetrics(pageUrl) 
    : getResourceMetrics();
  
  // Calcul du score global
  const performanceScore = getWebVitalsScore(webVitals);
  const performanceRating = getRatingFromScore(performanceScore);
  const feedbackMessage = getFeedbackFromScore(performanceScore);
  
  // Couleurs en fonction du mode (clair/sombre)
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fonction pour formater les millisecondes en format lisible
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };
  
  // Fonction pour formater la taille des ressources
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Fonction pour obtenir la couleur en fonction de l'évaluation
  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good': return 'green.500';
      case 'needs-improvement': return 'orange.500';
      case 'poor': return 'red.500';
      default: return 'gray.500';
    }
  };
  
  // Fonction pour obtenir l'icône en fonction de l'évaluation
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircleIcon color="green.500" />;
      case 'needs-improvement': return <WarningIcon color="orange.500" />;
      case 'poor': return <WarningIcon color="red.500" />;
      default: return <InfoIcon color="gray.500" />;
    }
  };
  
  // Fonction pour basculer l'état d'expansion d'une section
  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };
  
  // Rendu d'une métrique Web Vital
  const renderWebVitalMetric = (metric: WebVitalMetric) => {
    // Définitions des métriques avec leurs descriptions
    const metricDetails: Record<string, { name: string, description: string }> = {
      LCP: { 
        name: 'Largest Contentful Paint', 
        description: 'Mesure le temps de chargement du plus grand élément visible à l\'écran.' 
      },
      FID: { 
        name: 'First Input Delay', 
        description: 'Mesure le temps de réponse à la première interaction de l\'utilisateur.' 
      },
      CLS: { 
        name: 'Cumulative Layout Shift', 
        description: 'Mesure la stabilité visuelle de la page pendant le chargement.' 
      },
      TTFB: { 
        name: 'Time To First Byte', 
        description: 'Mesure le temps entre la requête et la réception du premier octet.' 
      },
      FCP: { 
        name: 'First Contentful Paint', 
        description: 'Mesure le temps jusqu\'à l\'affichage du premier contenu.' 
      },
      INP: { 
        name: 'Interaction to Next Paint', 
        description: 'Mesure la réactivité de la page aux interactions utilisateur.' 
      }
    };
    
    const metricDetail = metricDetails[metric.name] || { name: metric.name, description: 'Métrique de performance web.' };
    const metricRating = metric.rating || getRating(metric.name, metric.value);
    
    return (
      <Stat key={metric.name} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
        <Flex justifyContent="space-between">
          <Box>
            <StatLabel fontWeight="medium">{metricDetail.name} ({metric.name})</StatLabel>
            <StatNumber>{formatTime(metric.value)}</StatNumber>
            <StatHelpText>{metricDetail.description}</StatHelpText>
          </Box>
          <Badge 
            colorScheme={metricRating === 'good' ? 'green' : metricRating === 'needs-improvement' ? 'orange' : 'red'}
            alignSelf="flex-start"
            px={2}
            py={1}
            borderRadius="full"
          >
            {metricRating === 'needs-improvement' ? 'À améliorer' : metricRating === 'good' ? 'Bon' : 'Médiocre'}
          </Badge>
        </Flex>
        
        {/* Détails supplémentaires si disponibles */}
        {metric.delta && (
          <Text mt={2} fontSize="sm" color="gray.500">
            Variation: {metric.delta > 0 ? '+' : ''}{formatTime(metric.delta)}
          </Text>
        )}
      </Stat>
    );
  };

  // Rendu d'une recommandation d'optimisation
  const renderOptimizationTip = (tip: string, index: number) => (
    <ListItem key={index} mb={2}>
      <ListIcon as={ChevronRightIcon} color="blue.500" />
      {tip}
    </ListItem>
  );
  
  // Rendu des ressources lentes ou volumineuses
  const renderResourceItem = (resource: ResourceMetric) => (
    <Tr key={resource.name}>
      <Td maxW="300px" overflowX="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {resource.name}
      </Td>
      <Td>{resource.type}</Td>
      <Td isNumeric>{formatTime(resource.duration)}</Td>
      <Td isNumeric>{formatSize(resource.size || 0)}</Td>
      <Td>
        <Badge 
          colorScheme={resource.isSlow ? 'red' : resource.isLarge ? 'orange' : 'green'}
          px={2}
          py={1}
          borderRadius="full"
        >
          {resource.isSlow ? 'Lent' : resource.isLarge ? 'Volumineux' : 'OK'}
        </Badge>
      </Td>
    </Tr>
  );
  
  // S'il n'y a pas de données à afficher
  if (!webVitals.length && !pageLoadMetrics && !resourceMetrics.length) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" bg={cardBg} textAlign="center">
        <Heading size="md" mb={4}>Aucune donnée de performance disponible</Heading>
        <Text>Naviguez sur le site pour collecter des données de performance.</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* En-tête avec score global */}
      <Box
        bg={useColorModeValue('blue.50', 'blue.900')}
        p={6}
        borderRadius="lg"
        mb={6}
      >
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} justify="space-between">
          <Box textAlign={{ base: 'center', md: 'left' }} mb={{ base: 4, md: 0 }}>
            <Heading size="lg">Rapport de Performance</Heading>
            <Text mt={1} color={useColorModeValue('gray.600', 'gray.400')}>
              {pageUrl ? `Pour: ${pageUrl}` : 'Page actuelle'}
            </Text>
            <Text mt={4}>{feedbackMessage}</Text>
          </Box>
          
          <Flex 
            direction="column" 
            align="center" 
            bg={cardBg} 
            p={4} 
            borderRadius="md" 
            borderWidth="1px"
            borderColor={borderColor}
            minW="150px"
          >
            <Text fontSize="sm" fontWeight="medium" mb={1}>Score Global</Text>
            <Box position="relative" width="120px" height="120px">
              <CircularProgress 
                value={performanceScore} 
                color={getRatingColor(performanceRating)} 
                thickness={8}
                size="120px"
              />
              <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)"
                textAlign="center"
              >
                <Text fontSize="2xl" fontWeight="bold">{Math.round(performanceScore)}</Text>
                <Text fontSize="xs" textTransform="uppercase">/ 100</Text>
              </Box>
            </Box>
            <Badge
              mt={2}
              colorScheme={performanceRating === 'good' ? 'green' : performanceRating === 'needs-improvement' ? 'orange' : 'red'}
              px={2}
              py={1}
              borderRadius="full"
            >
              {performanceRating === 'good' ? 'Bon' : performanceRating === 'needs-improvement' ? 'À améliorer' : 'Médiocre'}
            </Badge>
          </Flex>
        </Flex>
      </Box>
      
      {/* Tabs pour les différentes catégories de métriques */}
      <Tabs isFitted variant="enclosed" onChange={(index) => setActiveTab(index)} colorScheme="blue">
        <TabList mb="1em">
          <Tab>Web Vitals</Tab>
          <Tab>Chargement de Page</Tab>
          <Tab>Ressources</Tab>
          <Tab>Recommandations</Tab>
        </TabList>
        
        <TabPanels>
          {/* Tab 1: Web Vitals */}
          <TabPanel>
            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              {webVitals.length > 0 ? (
                webVitals.map(metric => renderWebVitalMetric(metric))
              ) : (
                <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                  <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <Text align="center">Aucune métrique Web Vitals disponible</Text>
                  </Box>
                </GridItem>
              )}
            </Grid>
          </TabPanel>
          
          {/* Tab 2: Chargement de Page */}
          <TabPanel>
            {pageLoadMetrics ? (
              <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                <GridItem colSpan={1}>
                  <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <StatLabel fontWeight="medium">Temps de chargement total</StatLabel>
                    <StatNumber>{formatTime(pageLoadMetrics.loadComplete || pageLoadMetrics.loadTime || 0)}</StatNumber>
                    <Progress 
                      mt={2} 
                      value={Math.min(100, ((pageLoadMetrics.loadComplete || pageLoadMetrics.loadTime || 0) / 30))} 
                      colorScheme={(pageLoadMetrics.loadComplete || pageLoadMetrics.loadTime || 0) < 2000 ? 'green' : (pageLoadMetrics.loadComplete || pageLoadMetrics.loadTime || 0) < 5000 ? 'orange' : 'red'} 
                      size="sm" 
                      borderRadius="full"
                    />
                  </Box>
                </GridItem>
                
                <GridItem colSpan={1}>
                  <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <StatLabel fontWeight="medium">Interactivité DOM</StatLabel>
                    <StatNumber>{formatTime(pageLoadMetrics.domInteractive || pageLoadMetrics.interactiveTime || 0)}</StatNumber>
                    <Progress 
                      mt={2} 
                      value={Math.min(100, ((pageLoadMetrics.domInteractive || pageLoadMetrics.interactiveTime || 0) / 30))} 
                      colorScheme={(pageLoadMetrics.domInteractive || pageLoadMetrics.interactiveTime || 0) < 1500 ? 'green' : (pageLoadMetrics.domInteractive || pageLoadMetrics.interactiveTime || 0) < 3500 ? 'orange' : 'red'} 
                      size="sm" 
                      borderRadius="full"
                    />
                  </Box>
                </GridItem>
                
                <GridItem colSpan={1}>
                  <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <StatLabel fontWeight="medium">First Contentful Paint</StatLabel>
                    <StatNumber>{formatTime(pageLoadMetrics.firstContentfulPaint || 0)}</StatNumber>
                    <Progress 
                      mt={2} 
                      value={Math.min(100, ((pageLoadMetrics.firstContentfulPaint || 0) / 30))} 
                      colorScheme={(pageLoadMetrics.firstContentfulPaint || 0) < 1000 ? 'green' : (pageLoadMetrics.firstContentfulPaint || 0) < 3000 ? 'orange' : 'red'} 
                      size="sm" 
                      borderRadius="full"
                    />
                  </Box>
                </GridItem>
                
                <GridItem colSpan={1}>
                  <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <StatLabel fontWeight="medium">Appareil & Connexion</StatLabel>
                    <Text mt={2}><strong>Type d'appareil :</strong> {pageLoadMetrics.isMobile ? 'Mobile' : 'Desktop'}</Text>
                    <Text><strong>Connexion :</strong> {pageLoadMetrics.connection || 'Non disponible'}</Text>
                  </Box>
                </GridItem>
              </Grid>
            ) : (
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                <Text align="center">Aucune métrique de chargement de page disponible</Text>
              </Box>
            )}
          </TabPanel>
          
          {/* Tab 3: Ressources */}
          <TabPanel>
            {resourceMetrics.length > 0 ? (
              <>
                <Box borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg} overflow="hidden">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Nom</Th>
                        <Th>Type</Th>
                        <Th isNumeric>Durée</Th>
                        <Th isNumeric>Taille</Th>
                        <Th>Statut</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {resourceMetrics.slice(0, 20).map(resource => renderResourceItem(resource))}
                    </Tbody>
                  </Table>
                </Box>
                
                {resourceMetrics.length > 20 && (
                  <Text mt={2} fontSize="sm" color="gray.500" textAlign="center">
                    Affichage de 20 ressources sur {resourceMetrics.length}
                  </Text>
                )}
                
                <Box mt={6}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="sm">Statistiques des ressources</Heading>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleSection('resourceStats')}
                      rightIcon={expandedSections.has('resourceStats') ? undefined : <ChevronRightIcon />}
                    >
                      {expandedSections.has('resourceStats') ? 'Masquer' : 'Afficher'}
                    </Button>
                  </Flex>
                  
                  {expandedSections.has('resourceStats') && (
                    <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mt={2}>
                      <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                        <StatLabel>Nombre total</StatLabel>
                        <StatNumber>{resourceMetrics.length}</StatNumber>
                      </Box>
                      
                      <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                        <StatLabel>Poids total</StatLabel>
                        <StatNumber>
                          {formatSize(resourceMetrics.reduce((sum, r) => sum + (r.size || 0), 0))}
                        </StatNumber>
                      </Box>
                      
                      <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                        <StatLabel>Ressources lentes</StatLabel>
                        <StatNumber>
                          {resourceMetrics.filter(r => r.isSlow).length}
                        </StatNumber>
                      </Box>
                      
                      <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                        <StatLabel>Ressources volumineuses</StatLabel>
                        <StatNumber>
                          {resourceMetrics.filter(r => r.isLarge).length}
                        </StatNumber>
                      </Box>
                    </Grid>
                  )}
                </Box>
              </>
            ) : (
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                <Text align="center">Aucune métrique de ressource disponible</Text>
              </Box>
            )}
          </TabPanel>
          
          {/* Tab 4: Recommandations */}
          <TabPanel>
            <Box p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
              <Heading size="md" mb={4}>Recommandations d'optimisation</Heading>
              
              <Box mb={6}>
                <Heading size="sm" mb={2} color="blue.500">Basées sur les Web Vitals</Heading>
                <List spacing={2}>
                  {webVitals.some(v => v.rating === 'poor' || v.rating === 'needs-improvement') ? (
                    webVitals
                      .filter(v => v.rating === 'poor' || v.rating === 'needs-improvement')
                      .map((v, i) => {
                        let tips: string[] = [];
                        
                        if (v.name === 'LCP' && v.rating !== 'good') {
                          tips = [
                            'Optimisez les images principales et utilisez des formats modernes (WebP)',
                            'Implémentez le lazy loading pour les images hors-écran',
                            'Améliorez le temps de réponse du serveur (TTFB)',
                            'Utilisez un CDN pour les ressources statiques'
                          ];
                        } else if (v.name === 'FID' && v.rating !== 'good') {
                          tips = [
                            'Réduisez le code JavaScript non essentiel',
                            'Divisez les tâches JavaScript longues en plus petites',
                            'Utilisez Web Workers pour les opérations complexes',
                            'Différez le chargement du JavaScript non critique'
                          ];
                        } else if (v.name === 'CLS' && v.rating !== 'good') {
                          tips = [
                            'Spécifiez les dimensions des images et des éléments médias',
                            'Réservez l\'espace pour les publicités et contenus dynamiques',
                            'Évitez d\'insérer du contenu au-dessus du contenu existant',
                            'Préchargez les polices personnalisées'
                          ];
                        } else if (v.name === 'TTFB' && v.rating !== 'good') {
                          tips = [
                            'Optimisez la performance du serveur',
                            'Utilisez un CDN pour les utilisateurs distants',
                            'Mettez en cache le contenu statique',
                            'Établissez des connexions précoces avec rel=preconnect'
                          ];
                        }
                        
                        return (
                          <Box key={i} mb={4}>
                            <Flex align="center" mb={1}>
                              {getRatingIcon(v.rating)}
                              <Text ml={2} fontWeight="medium">
                                {v.name}: {v.rating === 'needs-improvement' ? 'À améliorer' : 'Médiocre'} ({formatTime(v.value)})
                              </Text>
                            </Flex>
                            <List ml={6} mt={1}>
                              {tips.map((tip, j) => renderOptimizationTip(tip, j))}
                            </List>
                          </Box>
                        );
                      })
                  ) : (
                    <Text color="green.500">Toutes les métriques Web Vitals sont bonnes. Félicitations !</Text>
                  )}
                </List>
              </Box>
              
              <Divider my={4} />
              
              <Box mb={6}>
                <Heading size="sm" mb={2} color="blue.500">Basées sur les ressources</Heading>
                <List spacing={2}>
                  {resourceMetrics.length > 0 ? (
                    generateOptimizationTips(resourceMetrics).map((tip, i) => renderOptimizationTip(tip, i))
                  ) : (
                    <Text>Aucune information sur les ressources disponible</Text>
                  )}
                </List>
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Composant pour l'indicateur de progrès circulaire
const CircularProgress: React.FC<{
  value: number;
  color: string;
  thickness: number;
  size: string;
}> = ({ value, color, thickness, size }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (value / 100) * circumference;
  
  return (
    <Box position="relative" width={size} height={size}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 120"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke={useColorModeValue('gray.100', 'gray.700')}
          strokeWidth={thickness}
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
};

export default PerformanceReport; 