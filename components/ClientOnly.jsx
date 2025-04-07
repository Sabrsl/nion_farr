import { useEffect, useState } from 'react';

/**
 * Ce composant garantit que son contenu n'est rendu que côté client, évitant les erreurs d'hydratation.
 * Utilisez-le pour envelopper tout composant qui utilise des API spécifiques au navigateur comme localStorage, window, etc.
 */
export default function ClientOnly({ children, ...delegated }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Pendant le rendu côté serveur ou le premier rendu côté client, retourner un placeholder vide
  if (!hasMounted) {
    // Retourner un div vide qui sera remplacé côté client
    return <div {...delegated} suppressHydrationWarning />;
  }
  
  // Une fois monté (côté client uniquement), afficher les enfants
  return <div {...delegated} suppressHydrationWarning>{children}</div>;
} 