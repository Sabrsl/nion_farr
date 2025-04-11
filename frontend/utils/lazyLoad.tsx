import React, { lazy, Suspense, startTransition, useState, useEffect } from 'react';

/**
 * Composant de fallback par défaut pour le chargement
 */
export const DefaultLoadingFallback = () => (
  <div className="animate-pulse w-full h-full min-h-[100px] bg-gray-100 rounded-md" />
);

/**
 * Charge dynamiquement un composant avec React.lazy
 * @param componentImport - Fonction qui importe le composant
 * @param fallback - Élément à afficher pendant le chargement
 */
export function lazyLoad(
  componentImport: () => Promise<any>,
  fallback = <DefaultLoadingFallback />
) {
  const LazyComponent = lazy(componentImport);

  return (props: any) => {
    // Solution pour le problème d'hydratation avec Suspense
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
      // Attendre que l'hydratation initiale soit terminée
      startTransition(() => {
        setIsClient(true);
      });
    }, []);

    // Pendant l'hydratation du SSR, afficher uniquement le fallback
    if (!isClient) {
      return fallback;
    }

    // Après l'hydratation, afficher le composant lazy dans Suspense
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Exemple d'utilisation:
 * 
 * // Dans un fichier components/index.ts:
 * export const LazyServiceDetails = lazyLoad(() => import('./services/ServiceDetails'));
 * 
 * // Dans votre composant:
 * import { LazyServiceDetails } from '../components';
 * 
 * const MyComponent = () => {
 *   return (
 *     <div>
 *       <LazyServiceDetails serviceId="123" />
 *     </div>
 *   );
 * }; 
 */ 