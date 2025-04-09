import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API désactivée en production
 * 
 * Cette API permettait de tester les templates d'email pendant le développement.
 * Elle a été désactivée en environnement de production pour des raisons de sécurité.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ne plus autoriser l'utilisation de cette API en production
  return res.status(403).json({ 
    error: 'Accès refusé',
    message: 'Cette API de test est désactivée en environnement de production.'
  });
} 