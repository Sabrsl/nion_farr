import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, TextField } from '@mui/material';
import Layout from '../components/layout/Layout';

const TestApi = () => {
  const [apiUrl, setApiUrl] = useState('/api/health');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { text, _nonJson: true };
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Test API Simplifiée
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="URL de l'API"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testApi}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Tester l\'API'}
          </Button>
        </Box>

        {error && (
          <Paper sx={{ p: 2, bgcolor: '#ffebee', mb: 3 }}>
            <Typography color="error">Erreur: {error}</Typography>
          </Paper>
        )}

        {response && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Statut: {response.status} {response.statusText}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Réponse:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <pre style={{ overflow: 'auto', margin: 0 }}>
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </Paper>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default TestApi; 