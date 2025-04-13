# Module de Performance pour NionFar

## Note personnelle

Ce module est développé pour mon usage personnel et n'est pas destiné à être utilisé ou maintenu par d'autres personnes. Les fonctionnalités sont ajustées selon mes besoins spécifiques.

## Fonctionnalités

- **Surveillance de la mémoire** - Suivi de l'utilisation de la mémoire et détection des fuites
- **Métriques d'API** - Collecte et analyse des statistiques d'utilisation de l'API
- **Surveillance de la santé** - Vérification régulière de l'état du système et des services externes
- **API de performance** - Endpoints sécurisés pour accéder aux métriques en temps réel

## Architecture

Le module est structuré en plusieurs composants:

- `memory-monitor.ts` - Gestion et analyse de l'utilisation de la mémoire
- `api-metrics.ts` - Collecte des métriques sur l'utilisation de l'API
- `system-health.ts` - Surveillance de la santé du système et des services externes
- `performance.service.ts` - Service central qui coordonne les différents aspects de la surveillance
- `performance.controller.ts` - API REST pour accéder aux métriques (réservée aux administrateurs)

## Configuration

Le module utilise les variables d'environnement suivantes:

- `ENABLE_PERFORMANCE_MONITORING` - Active/désactive la surveillance (défaut: `true`)
- `MEMORY_MONITORING_INTERVAL` - Intervalle entre les vérifications de mémoire en ms (défaut: `1800000`)
- `EXTERNAL_SERVICES_TO_MONITOR` - JSON des services externes à surveiller

Exemple de configuration pour les services externes:
```json
[
  {
    "name": "Payment Gateway",
    "url": "https://api.payment-provider.com/health",
    "timeout": 5000
  },
  {
    "name": "Email Service",
    "url": "https://api.email-service.com/status",
    "timeout": 3000
  }
]
```

## Utilisation

### Accès aux métriques via l'API

Les endpoints suivants sont disponibles (réservés aux administrateurs):

- `GET /api/performance/dashboard` - Tableau de bord complet des performances
- `GET /api/performance/memory` - Historique des métriques de mémoire
- `GET /api/performance/api-metrics` - Historique des métriques d'API
- `GET /api/performance/health` - Historique des vérifications de santé
- `GET /api/performance/health/current` - État de santé actuel

### Intégration dans d'autres modules

```typescript
import { PerformanceService } from '../performance/performance.service';

@Injectable()
export class MyService {
  constructor(private readonly performanceService: PerformanceService) {}
  
  async someMethod() {
    // Accéder aux métriques de performance
    const dashboard = await this.performanceService.getPerformanceDashboard();
    console.log(`État du système: ${dashboard.systemHealth.status}`);
  }
}
```

## Bonnes pratiques

- Les métriques collectées sont automatiquement limitées en taille pour éviter une consommation excessive de mémoire
- La surveillance est adaptative et réduit sa fréquence dans les environnements à ressources limitées
- Les données historiques permettent d'analyser les tendances de performance et d'identifier les problèmes potentiels 