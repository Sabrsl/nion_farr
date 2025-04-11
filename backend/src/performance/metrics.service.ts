import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as client from 'prom-client';
import { StructuredLoggerService } from '../common/logger/structured-logger.service';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: client.Registry;
  
  // Métriques de base
  private httpRequestTotal: client.Counter;
  private httpRequestDuration: client.Histogram;
  private httpRequestsInProgress: client.Gauge;
  private databaseQueryDuration: client.Histogram;
  private memoryUsage: client.Gauge;
  private cpuUsage: client.Gauge;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService,
  ) {
    this.logger.setContext('MetricsService');
    
    // Créer un registre Prometheus
    this.register = new client.Registry();
    
    // Ajouter les métriques par défaut
    if (process.env.NODE_ENV === 'production') {
      client.collectDefaultMetrics({ register: this.register });
    }
    
    // Initialiser les métriques personnalisées
    this.setupMetrics();
  }
  
  onModuleInit() {
    this.logger.log('Métriques Prometheus initialisées');
    this.startMemoryMonitoring();
  }
  
  /**
   * Obtenir le registre Prometheus au format texte pour exposition
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
  
  /**
   * Configurer toutes les métriques personnalisées
   */
  private setupMetrics() {
    // Compteur de requêtes HTTP
    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'] as const,
      registers: [this.register],
    });
    
    // Histogramme de durée des requêtes HTTP
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'] as const,
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });
    
    // Gauge des requêtes HTTP en cours
    this.httpRequestsInProgress = new client.Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently in progress',
      labelNames: ['method', 'route'] as const,
      registers: [this.register],
    });
    
    // Histogramme de durée des requêtes DB
    this.databaseQueryDuration = new client.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'collection'] as const,
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });
    
    // Gauge d'utilisation mémoire
    this.memoryUsage = new client.Gauge({
      name: 'nodejs_memory_usage_bytes',
      help: 'Memory usage of the Node.js process',
      labelNames: ['type'] as const,
      registers: [this.register],
    });
    
    // Gauge d'utilisation CPU
    this.cpuUsage = new client.Gauge({
      name: 'nodejs_cpu_usage_percentage',
      help: 'CPU usage percentage of the Node.js process',
      registers: [this.register],
    });
  }
  
  /**
   * Enregistrer une requête HTTP
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration,
    );
  }
  
  /**
   * Suivre les requêtes HTTP en cours
   */
  startHttpRequest(method: string, route: string) {
    this.httpRequestsInProgress.inc({ method, route });
    return Date.now();
  }
  
  endHttpRequest(method: string, route: string, startTime: number, statusCode: number) {
    const duration = (Date.now() - startTime) / 1000;
    this.httpRequestsInProgress.dec({ method, route });
    this.recordHttpRequest(method, route, statusCode, duration);
    return duration;
  }
  
  /**
   * Enregistrer une requête de base de données
   */
  recordDatabaseQuery(operation: string, collection: string, duration: number) {
    this.databaseQueryDuration.observe({ operation, collection }, duration);
  }
  
  /**
   * Mesurer une opération de base de données
   */
  async measureDatabaseOperation<T>(
    operation: string,
    collection: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    try {
      return await callback();
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      this.recordDatabaseQuery(operation, collection, duration);
    }
  }
  
  /**
   * Surveiller l'utilisation de la mémoire et du CPU
   */
  private startMemoryMonitoring() {
    const interval = parseInt(
      this.configService.get('METRICS_INTERVAL') || '15000',
      10,
    );
    
    setInterval(() => {
      try {
        const memUsage = process.memoryUsage();
        this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
        this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
        this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
        this.memoryUsage.set({ type: 'external' }, memUsage.external);
        
        // Calculer l'utilisation du CPU est complexe, ici nous utilisons une approximation
        const startUsage = process.cpuUsage();
        setTimeout(() => {
          const endUsage = process.cpuUsage(startUsage);
          const totalUsage = endUsage.user + endUsage.system;
          // Convertir de microsecondes à pourcentage sur 1 sec de mesure
          const cpuPercent = (totalUsage / 1000 / 100);
          this.cpuUsage.set(cpuPercent > 100 ? 100 : cpuPercent);
        }, 1000);
      } catch (error) {
        this.logger.error('Erreur lors de la collecte des métriques de performance', error.stack);
      }
    }, interval);
  }
} 