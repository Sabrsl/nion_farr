import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { Button, Card, Typography, Box, Grid, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';

type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  provider: {
    id: string;
    fullName: string;
  };
};

type User = {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
};

type Order = {
  id: string;
  title: string;
  status: string;
  price: number;
  serviceName: string;
  providerName: string;
};

const ApiTestPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState({
    services: false,
    users: false,
    orders: false,
  });
  const [error, setError] = useState({
    services: null,
    users: null,
    orders: null,
  });

  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    setError(prev => ({ ...prev, services: null }));
    
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services || []);
      } else {
        setError(prev => ({ ...prev, services: data.error || 'Une erreur est survenue' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, services: err.message || 'Une erreur est survenue' }));
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(prev => ({ ...prev, users: null }));
    
    try {
      const response = await fetch('/api/users/search?role=prestataire');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(prev => ({ ...prev, users: data.error || 'Une erreur est survenue' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, users: err.message || 'Une erreur est survenue' }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    setError(prev => ({ ...prev, orders: null }));
    
    try {
      const response = await fetch('/api/orders?userId=user-123&role=client');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(prev => ({ ...prev, orders: data.error || 'Une erreur est survenue' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, orders: err.message || 'Une erreur est survenue' }));
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const createOrder = async () => {
    if (!services.length) return;
    
    const serviceId = services[0].id;
    const providerId = services[0].provider.id;
    
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          clientId: 'user-123',
          providerId,
          title: "Nouvelle commande test",
          price: services[0].price,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: "Ceci est une commande de test créée depuis la page de test API."
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Commande créée avec succès!');
        fetchOrders();
      } else {
        alert(`Erreur: ${data.error || 'Une erreur est survenue'}`);
      }
    } catch (err) {
      alert(`Erreur: ${err.message || 'Une erreur est survenue'}`);
    }
  };

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'jean.dupont@example.com',
          password: 'password123',
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Connexion réussie! Utilisateur: ${data.user.fullName}`);
      } else {
        alert(`Erreur: ${data.error || 'Une erreur est survenue'}`);
      }
    } catch (err) {
      alert(`Erreur: ${err.message || 'Une erreur est survenue'}`);
    }
  };

  return (
    <Layout title="Test de l'API | Nionfar">
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test de communication avec l'API mockée
        </Typography>
        
        <Typography variant="body1" paragraph>
          Cette page vous permet de tester la communication entre le frontend et l'API simulée par MSW (Mock Service Worker).
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Services
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchServices}
                disabled={loading.services}
                sx={{ mb: 2 }}
              >
                {loading.services ? <CircularProgress size={24} /> : 'Charger les services'}
              </Button>
              
              {error.services && (
                <Typography color="error" variant="body2">
                  {error.services}
                </Typography>
              )}
              
              <List>
                {services.map(service => (
                  <React.Fragment key={service.id}>
                    <ListItem>
                      <ListItemText 
                        primary={service.title}
                        secondary={`${service.price} XOF - ${service.provider.fullName}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {!loading.services && services.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                    Aucun service à afficher
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Prestataires
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchUsers}
                disabled={loading.users}
                sx={{ mb: 2 }}
              >
                {loading.users ? <CircularProgress size={24} /> : 'Charger les prestataires'}
              </Button>
              
              {error.users && (
                <Typography color="error" variant="body2">
                  {error.users}
                </Typography>
              )}
              
              <List>
                {users.map(user => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemText 
                        primary={user.fullName}
                        secondary={user.email}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {!loading.users && users.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                    Aucun prestataire à afficher
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Commandes
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchOrders}
                disabled={loading.orders}
                sx={{ mb: 2, mr: 1 }}
              >
                {loading.orders ? <CircularProgress size={24} /> : 'Charger les commandes'}
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={createOrder}
                disabled={services.length === 0}
                sx={{ mb: 2 }}
              >
                Créer une commande
              </Button>
              
              {error.orders && (
                <Typography color="error" variant="body2">
                  {error.orders}
                </Typography>
              )}
              
              <List>
                {orders.map(order => (
                  <React.Fragment key={order.id}>
                    <ListItem>
                      <ListItemText 
                        primary={order.title}
                        secondary={`${order.status} - ${order.price} XOF - ${order.providerName}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {!loading.orders && orders.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                    Aucune commande à afficher
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={testAuth}
            sx={{ mx: 1 }}
          >
            Tester l'authentification
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default ApiTestPage; 