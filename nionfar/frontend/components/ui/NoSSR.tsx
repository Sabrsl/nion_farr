import { ReactNode, useEffect, useState } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Composant qui désactive le rendu côté serveur pour son contenu enfant.
 * Utile pour les composants qui utilisent des API navigateur ou qui causent
 * des erreurs d'hydratation.
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pendant le rendu serveur ou l'hydratation, renvoyer le fallback
  if (!isClient) {
    return <>{fallback}</>;
  }

  // Une fois l'hydratation terminée et que nous sommes côté client, rendre les enfants
  return <>{children}</>;
}

export default NoSSR; 