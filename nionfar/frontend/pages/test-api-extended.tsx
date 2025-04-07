import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  Box, Button, Card, Container, Divider, Grid, Paper, Typography, 
  Tabs, Tab, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';

// Type d'onglet
type TestTabType = 'auth' | 'services' | 'users' | 'orders' | 'payments' | 'messages';

// Type pour les détails d'endpoint
interface EndpointDetails {
  label: string;
  url: string;
  method: string;
  hasBody?: boolean;
}

// URL par défaut et méthodes pour chaque onglet
const defaultEndpoints = {
  auth: { url: '/api/auth/login', method: 'POST', body: { email: 'jean.dupont@example.com', password: 'password123' } },
  services: { url: '/api/services', method: 'GET' },
  users: { url: '/api/users/search?role=prestataire', method: 'GET' },
  orders: { url: '/api/orders?userId=user-123&role=client', method: 'GET' },
  payments: { url: '/api/payments/process-payment', method: 'POST', body: { orderId: 'order-2', amount: 50000, paymentMethod: 'orange_money' } },
  messages: { url: '/api/conversations?userId=user-123', method: 'GET' }
};

// Liste des endpoints par catégorie
const apiEndpoints: Record<TestTabType, EndpointDetails[]> = {
  auth: [
    { label: 'Connexion', url: '/api/auth/login', method: 'POST', hasBody: true },
    { label: 'Inscription', url: '/api/auth/register', method: 'POST', hasBody: true }
  ],
  services: [
    { label: 'Tous les services', url: '/api/services', method: 'GET' },
    { label: 'Service par ID', url: '/api/services/service-1', method: 'GET' }
  ],
  users: [
    { label: 'Recherche de prestataires', url: '/api/users/search?role=prestataire', method: 'GET' },
    { label: 'Utilisateur par ID', url: '/api/users/user-456', method: 'GET' }
  ],
  orders: [
    { label: 'Commandes d\'un client', url: '/api/orders?userId=user-123&role=client', method: 'GET' },
    { label: 'Commande par ID', url: '/api/orders/order-1', method: 'GET' },
    { label: 'Créer une commande', url: '/api/orders/create', method: 'POST', hasBody: true },
    { label: 'Mise à jour du statut', url: '/api/orders/update-status', method: 'PUT', hasBody: true }
  ],
  payments: [
    { label: 'Traiter un paiement', url: '/api/payments/process-payment', method: 'POST', hasBody: true },
    { label: 'Statut d\'un paiement', url: '/api/payments/payment-1/status', method: 'GET' },
    { label: 'Initier Orange Money', url: '/api/payments/orange-money/initiate', method: 'POST', hasBody: true },
    { label: 'Initier Wave', url: '/api/payments/wave/initiate', method: 'POST', hasBody: true }
  ],
  messages: [
    { label: 'Conversations', url: '/api/conversations?userId=user-123', method: 'GET' },
    { label: 'Messages d\'une conversation', url: '/api/conversations/conv-1/messages', method: 'GET' },
    { label: 'Envoyer un message', url: '/api/messages/send', method: 'POST', hasBody: true },
    { label: 'Créer une conversation', url: '/api/conversations/create', method: 'POST', hasBody: true },
    { label: 'Marquer comme lu', url: '/api/messages/mark-read', method: 'PUT', hasBody: true }
  ]
};

// Corps de requête par défaut pour les endpoints POST/PUT
const defaultRequestBodies = {
  '/api/auth/login': { email: 'jean.dupont@example.com', password: 'password123' },
  '/api/auth/register': { 
    fullName: 'Nouveau Utilisateur', 
    email: 'nouveau@example.com', 
    password: 'password123', 
    role: 'client', 
    acceptTerms: true 
  },
  '/api/orders/create': { 
    title: 'Nouvelle commande test', 
    serviceId: 'service-1', 
    serviceName: 'Création de logo professionnel', 
    providerId: 'user-456', 
    providerName: 'Sophie Martin', 
    clientId: 'user-123', 
    clientName: 'Jean Dupont', 
    price: 15000 
  },
  '/api/orders/update-status': { 
    orderId: 'order-1', 
    status: 'terminé' 
  },
  '/api/payments/process-payment': { 
    orderId: 'order-2', 
    amount: 50000, 
    paymentMethod: 'orange_money'
  },
  '/api/payments/orange-money/initiate': { 
    orderId: 'order-2', 
    amount: 50000, 
    phoneNumber: '771234567',
    returnUrl: '/dashboard/payment/status'
  },
  '/api/payments/wave/initiate': { 
    orderId: 'order-2', 
    amount: 50000, 
    phoneNumber: '771234567',
    returnUrl: '/dashboard/payment/status'
  },
  '/api/messages/send': { 
    conversationId: 'conv-1', 
    senderId: 'user-123', 
    receiverId: 'user-456', 
    content: 'Ceci est un message de test.' 
  },
  '/api/conversations/create': { 
    senderId: 'user-123', 
    receiverId: 'user-789', 
    initialMessage: 'Bonjour, je souhaite discuter d\'un projet.',
    title: 'Nouveau projet'
  },
  '/api/messages/mark-read': { 
    conversationId: 'conv-2', 
    userId: 'user-123'
  }
};

const TestApiExtendedPage = () => {
  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState<TestTabType>('auth');
  
  // État pour suivre l'endpoint sélectionné dans chaque catégorie
  const [selectedEndpoint, setSelectedEndpoint] = useState<Record<TestTabType, string>>({
    auth: '/api/auth/login',
    services: '/api/services',
    users: '/api/users/search?role=prestataire',
    orders: '/api/orders?userId=user-123&role=client',
    payments: '/api/payments/process-payment',
    messages: '/api/conversations?userId=user-123'
  });
  
  // État pour les corps de requête modifiables
  const [requestBodies, setRequestBodies] = useState<Record<string, any>>(defaultRequestBodies);
  
  // État pour le résultat de la requête API
  const [apiResult, setApiResult] = useState<{
    loading: boolean;
    result: any;
    error: string | null;
    status?: number;
  }>({
    loading: false,
    result: null,
    error: null
  });
  
  // Gérer le changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: TestTabType) => {
    setActiveTab(newValue);
  };
  
  // Gérer la sélection d'un endpoint
  const handleEndpointChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedEndpoint(prev => ({
      ...prev,
      [activeTab]: value
    }));
  };
  
  // Gérer la modification du corps de la requête
  const handleRequestBodyChange = (value: string) => {
    try {
      const parsedBody = JSON.parse(value);
      setRequestBodies(prev => ({
        ...prev,
        [selectedEndpoint[activeTab]]: parsedBody
      }));
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      // Ne pas mettre à jour si le JSON est invalide
    }
  };
  
  // Exécuter la requête API
  const executeApiRequest = async () => {
    setApiResult({
      loading: true,
      result: null,
      error: null
    });
    
    const currentUrl = selectedEndpoint[activeTab];
    const endpoint = getEndpointDetails();
    
    try {
      let response;
      if (endpoint.method === 'GET') {
        response = await fetch(currentUrl, {
          headers: {
            'Accept': 'application/json',
          }
        });
      } else {
        const body = requestBodies[currentUrl] || {};
        response = await fetch(currentUrl, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body)
        });
      }
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { text, _nonJson: true };
      }
      
      setApiResult({
        loading: false,
        result: data,
        error: null,
        status: response.status
      });
    } catch (error) {
      console.error('API request error:', error);
      setApiResult({
        loading: false,
        result: null,
        error: error.message || 'Une erreur est survenue lors de la requête'
      });
    }
  };
  
  // Récupérer les détails de l'endpoint actuel
  const getEndpointDetails = (): EndpointDetails => {
    const endpoints = apiEndpoints[activeTab];
    return endpoints.find(e => e.url === selectedEndpoint[activeTab]) || endpoints[0];
  };
  
  // Formater le corps de la requête pour l'affichage
  const getFormattedRequestBody = () => {
    const currentUrl = selectedEndpoint[activeTab];
    return JSON.stringify(requestBodies[currentUrl] || {}, null, 2);
  };
  
  // Afficher le résultat sous forme JSON formaté
  const displayResult = () => {
    if (apiResult.loading) return <Typography>Chargement en cours...</Typography>;
    if (apiResult.error) return (
      <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
        <Typography color="error">Erreur: {apiResult.error}</Typography>
      </Paper>
    );
    if (!apiResult.result) return <Typography>Aucun résultat</Typography>;
    
    return (
      <Paper sx={{ p: 2, bgcolor: apiResult.result.success ? '#e8f5e9' : '#ffebee' }}>
        <Typography variant="subtitle2" gutterBottom>
          Status HTTP: {apiResult.status || 'N/A'}
        </Typography>
        <pre style={{ 
          overflow: 'auto', 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px' 
        }}>
          {JSON.stringify(apiResult.result, null, 2)}
        </pre>
      </Paper>
    );
  };
  
  return (
    <Layout title="Test API Étendu | Nionfar">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test de l'API Nionfar - Version Étendue
        </Typography>
        
        <Typography variant="body1" paragraph>
          Cette page permet de tester tous les endpoints API disponibles, y compris les commandes, paiements et messages.
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Authentification" value="auth" />
            <Tab label="Services" value="services" />
            <Tab label="Utilisateurs" value="users" />
            <Tab label="Commandes" value="orders" />
            <Tab label="Paiements" value="payments" />
            <Tab label="Messages" value="messages" />
          </Tabs>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuration de la requête
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Endpoint</InputLabel>
                <Select
                  value={selectedEndpoint[activeTab]}
                  onChange={handleEndpointChange}
                  label="Endpoint"
                >
                  {apiEndpoints[activeTab].map((endpoint) => (
                    <MenuItem key={endpoint.url} value={endpoint.url}>
                      {endpoint.label} - {endpoint.method} {endpoint.url}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {getEndpointDetails().hasBody && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Corps de la requête (JSON)
                  </Typography>
                  <TextField
                    multiline
                    rows={10}
                    fullWidth
                    defaultValue={getFormattedRequestBody()}
                    onChange={(e) => handleRequestBodyChange(e.target.value)}
                    sx={{ fontFamily: 'monospace' }}
                  />
                </Box>
              )}
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={executeApiRequest}
                disabled={apiResult.loading}
              >
                Exécuter la requête
              </Button>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Résultat de la requête
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {displayResult()}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default TestApiExtendedPage; 