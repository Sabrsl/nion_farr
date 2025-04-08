import { ReactNode, useEffect, useState } from 'react';

// Types pour le composant ClientOnly
interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Composant qui désactive le rendu côté serveur pour son contenu enfant.
 * Evite les erreurs 'Objects are not valid as React child' en s'assurant que
 * les composants problématiques ne sont rendus que côté client.
 */
export function ClientOnly({ children, fallback = <div style={{ display: 'none' }}></div> }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div suppressHydrationWarning style={{ display: 'contents' }}>
      {isMounted ? children : fallback}
    </div>
  );
}

export default ClientOnly; 