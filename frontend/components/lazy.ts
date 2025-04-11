/**
 * Regroupement des composants avec chargement différé
 */
import { lazyLoad } from '../utils/lazyLoad';

// Composants de service
export const LazyServiceReviews = lazyLoad(() => import('./services/ServiceReviews').then(mod => ({ default: mod.ServiceReviews })));
export const LazyServicePackages = lazyLoad(() => import('./services/ServicePackages').then(mod => ({ default: mod.ServicePackages })));
export const LazyRelatedServices = lazyLoad(() => import('./services/RelatedServices').then(mod => ({ default: mod.RelatedServices })));

// Composants de tableau de bord
export const LazyPerformanceDashboard = lazyLoad(() => import('./performance/PerformanceDashboard'));
export const LazyPerformanceReport = lazyLoad(() => import('./PerformanceReport')); 