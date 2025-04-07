import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Box, Button, Card, Container, Divider, Grid, Paper, TextField, Typography } from '@mui/material';

const TestApiPage = () => {
  const [status, setStatus] = useState({
    auth: { loading: false, result: null, error: null },
    services: { loading: false, result: null, error: null },
    users: { loading: false, result: null, error: null }
  });

  // Test d'authentification
  const testAuth = async () => {
    setStatus(prev => ({ ...prev, auth: { loading: true, result: null, error: null } }));
    
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
      setStatus(prev => ({ 
        ...prev, 
        auth: { 
          loading: false, 
          result: data, 
          error: null,
          status: response.status
        } 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        auth: { 
          loading: false, 
          result: null, 
          error: error.message 
        } 
      }));
    }
  };

  // Test des services
  const testServices = async () => {
    setStatus(prev => ({ ...prev, services: { loading: true, result: null, error: null } }));
    
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      
      setStatus(prev => ({ 
        ...prev, 
        services: { 
          loading: false, 
          result: data, 
          error: null,
          status: response.status
        } 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        services: { 
          loading: false, 
          result: null, 
          error: error.message 
        } 
      }));
    }
  };

  // Test des utilisateurs
  const testUsers = async () => {
    setStatus(prev => ({ ...prev, users: { loading: true, result: null, error: null } }));
    
    try {
      const response = await fetch('/api/users/search?role=prestataire');
      const data = await response.json();
      
      setStatus(prev => ({ 
        ...prev, 
        users: { 
          loading: false, 
          result: data, 
          error: null,
          status: response.status
        } 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        users: { 
          loading: false, 
          result: null, 
          error: error.message 
        } 
      }));
    }
  };

  // Tester tous les endpoints
  const testAll = () => {
    testAuth();
    setTimeout(testServices, 500);
    setTimeout(testUsers, 1000);
  };

  // Afficher le résultat sous forme JSON formaté
  const displayResult = (result, error, loading, status) => {
    if (loading) return <Typography>Chargement en cours...</Typography>;
    if (error) return (
      <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
        <Typography color="error">Erreur: {error}</Typography>
      </Paper>
    );
    if (!result) return <Typography>Aucun résultat</Typography>;
    
    return (
      <Paper sx={{ p: 2, bgcolor: result.success ? '#e8f5e9' : '#ffebee' }}>
        <Typography variant="subtitle2" gutterBottom>
          Status HTTP: {status || 'N/A'}
        </Typography>
        <pre style={{ 
          overflow: 'auto', 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px' 
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </Paper>
    );
  };

  return (
    <Layout title="Test API | Nionfar">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test de l'API Nionfar
        </Typography>
        
        <Typography variant="body1" paragraph>
          Cette page permet de tester la communication entre le frontend et le backend (ou les mocks MSW).
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testAll}
            sx={{ mr: 2 }}
          >
            Tester toutes les API
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* Test d'authentification */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Authentification
              </Typography>
              <Typography variant="body2" paragraph>
                Test de connexion avec l'utilisateur Jean Dupont
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={testAuth}
                disabled={status.auth.loading}
                sx={{ mb: 2 }}
              >
                Tester l'authentification
              </Button>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                {displayResult(
                  status.auth.result, 
                  status.auth.error, 
                  status.auth.loading,
                  status.auth.status
                )}
              </Box>
            </Card>
          </Grid>
          
          {/* Test des services */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Services
              </Typography>
              <Typography variant="body2" paragraph>
                Test de récupération des services
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={testServices}
                disabled={status.services.loading}
                sx={{ mb: 2 }}
              >
                Tester les services
              </Button>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                {displayResult(
                  status.services.result, 
                  status.services.error, 
                  status.services.loading,
                  status.services.status
                )}
              </Box>
            </Card>
          </Grid>
          
          {/* Test des utilisateurs */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Utilisateurs
              </Typography>
              <Typography variant="body2" paragraph>
                Test de recherche d'utilisateurs (prestataires)
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={testUsers}
                disabled={status.users.loading}
                sx={{ mb: 2 }}
              >
                Tester les utilisateurs
              </Button>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                {displayResult(
                  status.users.result, 
                  status.users.error, 
                  status.users.loading,
                  status.users.status
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default TestApiPage; 