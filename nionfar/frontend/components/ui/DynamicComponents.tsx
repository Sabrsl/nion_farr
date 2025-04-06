import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

/**
 * HOC (Higher-Order Component) qui transforme n'importe quel composant en un composant
 * exclusivement client-side, évitant ainsi les erreurs d'hydratation.
 * 
 * @param Component - Le composant à charger uniquement côté client
 * @returns Un composant dynamique qui ne s'exécute que côté client
 */
export function withClientOnly<T>(Component: React.ComponentType<T>) {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false
  });
}

/**
 * Conteneur simple qui affiche un fallback pendant le chargement
 */
interface ClientContainerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ClientContainer = ({ children, fallback = null }: ClientContainerProps) => {
  return <>{children}</>;
};

/**
 * Version du conteneur qui ne s'exécute que côté client
 */
export const ClientOnlyContainer = withClientOnly(ClientContainer); 