import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // En production, on protège cette route par un code secret
  if (process.env.NODE_ENV === 'production') {
    const { secret } = req.query;
    if (secret !== 'debug-authorization-token') {
      return res.status(401).json({
        message: 'Non autorisé en production'
      });
    }
  }

  // Collecter les informations de débogage
  const debugInfo = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION
    },
    request: {
      method: req.method,
      url: req.url,
      headers: {
        // Ne pas envoyer les headers sensibles
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent'],
        'accept-language': req.headers['accept-language'],
        'content-type': req.headers['content-type']
      }
    },
    timestamp: new Date().toISOString()
  };

  // Vérifier les endpoints API disponibles
  let apiStatus = 'unknown';
  try {
    // Tester la connectivité avec le backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nionfar.up.railway.app/api';
    const apiResponse = await fetch(`${apiUrl}/health`, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      // Court timeout pour ne pas bloquer la réponse
      signal: AbortSignal.timeout(3000)
    });
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      apiStatus = 'available';
      // @ts-ignore
      debugInfo.apiResponse = data;
    } else {
      apiStatus = `error: ${apiResponse.status}`;
    }
  } catch (error) {
    apiStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  // @ts-ignore
  debugInfo.apiStatus = apiStatus;

  return res.status(200).json(debugInfo);
} 