/**
 * Utility functions for generating performance insights based on collected metrics
 */
import { WebVitalMetric, MetricRating, ResourceMetric, PageLoadMetrics } from './types';
import { getRating } from './webVitals';
// Define SLOW_RESOURCE_THRESHOLD directly instead of importing from resourceMonitor
const SLOW_RESOURCE_THRESHOLD = 500; // ms
import { classifyLoadTime } from './pageLoadMonitor';

// Types for insights
export type InsightSeverity = 'critical' | 'warning' | 'info';
export type InsightCategory = 'webVitals' | 'resources' | 'pageLoad' | 'general';

export interface PerformanceInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  severity: InsightSeverity;
  metrics?: string[];
  recommendation?: string;
  impact?: string;
}

/**
 * Generates insights based on Web Vitals metrics
 */
export function generateWebVitalsInsights(metrics: WebVitalMetric[]): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];
  
  // Group metrics by name for easier processing
  const metricsByName = metrics.reduce((acc, metric) => {
    acc[metric.name] = metric;
    return acc;
  }, {} as Record<string, WebVitalMetric>);
  
  // Check Largest Contentful Paint (LCP)
  if (metricsByName.LCP && metricsByName.LCP.rating === 'poor') {
    insights.push({
      id: 'slow-lcp',
      title: 'Slow Largest Contentful Paint',
      description: `Your LCP of ${metricsByName.LCP.value.toFixed(2)}ms exceeds the recommended threshold.`,
      category: 'webVitals',
      severity: 'critical',
      metrics: ['LCP'],
      recommendation: 'Optimize server response time, reduce resource load times, and optimize the critical rendering path.',
      impact: 'LCP directly affects perceived load speed and user satisfaction.'
    });
  } else if (metricsByName.LCP && metricsByName.LCP.rating === 'needs-improvement') {
    insights.push({
      id: 'moderate-lcp',
      title: 'Moderate Largest Contentful Paint',
      description: `Your LCP of ${metricsByName.LCP.value.toFixed(2)}ms could be improved to meet the good threshold.`,
      category: 'webVitals',
      severity: 'warning',
      metrics: ['LCP'],
      recommendation: 'Consider using preloading for critical resources and optimizing image loading.',
      impact: 'Improving LCP can enhance perceived performance and user retention.'
    });
  }
  
  // Check First Input Delay (FID)
  if (metricsByName.FID && metricsByName.FID.rating === 'poor') {
    insights.push({
      id: 'high-fid',
      title: 'High First Input Delay',
      description: `Your FID of ${metricsByName.FID.value.toFixed(2)}ms exceeds the recommended threshold.`,
      category: 'webVitals',
      severity: 'critical',
      metrics: ['FID'],
      recommendation: 'Break up long tasks, optimize JavaScript execution, and reduce JavaScript bundle size.',
      impact: 'FID directly impacts the perceived responsiveness of your site to user interactions.'
    });
  }
  
  // Check Cumulative Layout Shift (CLS)
  if (metricsByName.CLS && metricsByName.CLS.rating === 'poor') {
    insights.push({
      id: 'high-cls',
      title: 'High Cumulative Layout Shift',
      description: `Your CLS of ${metricsByName.CLS.value.toFixed(3)} exceeds the recommended threshold.`,
      category: 'webVitals',
      severity: 'critical',
      metrics: ['CLS'],
      recommendation: 'Set explicit dimensions for images and embeds, avoid inserting content above existing content, and use transform animations instead of those triggering layout changes.',
      impact: 'High CLS causes a poor user experience as page elements move unexpectedly.'
    });
  }
  
  // Check Time to First Byte (TTFB)
  if (metricsByName.TTFB && metricsByName.TTFB.rating === 'poor') {
    insights.push({
      id: 'slow-ttfb',
      title: 'Slow Time to First Byte',
      description: `Your TTFB of ${metricsByName.TTFB.value.toFixed(2)}ms indicates server response issues.`,
      category: 'webVitals',
      severity: 'warning',
      metrics: ['TTFB'],
      recommendation: 'Optimize server processing, use a CDN, and implement caching strategies.',
      impact: 'TTFB affects how quickly your site starts loading for users.'
    });
  }
  
  // Check Interaction to Next Paint (INP)
  if (metricsByName.INP && metricsByName.INP.rating === 'poor') {
    insights.push({
      id: 'slow-inp',
      title: 'Slow Interaction to Next Paint',
      description: `Your INP of ${metricsByName.INP.value.toFixed(2)}ms indicates poor responsiveness to user interactions.`,
      category: 'webVitals',
      severity: 'critical',
      metrics: ['INP'],
      recommendation: 'Optimize event handlers, use requestAnimationFrame for animations, and avoid layout thrashing.',
      impact: 'INP directly affects how responsive your site feels during user interactions.'
    });
  }
  
  return insights;
}

/**
 * Generates insights based on resource metrics
 */
export function generateResourceInsights(resources: ResourceMetric[]): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];
  
  // Count slow resources by type
  const slowResourcesByType: Record<string, ResourceMetric[]> = {};
  
  resources.forEach(resource => {
    if (resource.duration > SLOW_RESOURCE_THRESHOLD) {
      if (!slowResourcesByType[resource.type]) {
        slowResourcesByType[resource.type] = [];
      }
      slowResourcesByType[resource.type].push(resource);
    }
  });
  
  // Generate insights for slow images
  if (slowResourcesByType.img && slowResourcesByType.img.length > 2) {
    insights.push({
      id: 'slow-images',
      title: 'Slow Image Loading',
      description: `${slowResourcesByType.img.length} images are loading slowly (>${SLOW_RESOURCE_THRESHOLD}ms).`,
      category: 'resources',
      severity: 'warning',
      recommendation: 'Optimize images using modern formats (WebP), implement lazy loading, and use responsive images.',
      impact: 'Slow image loading affects LCP and overall page load time.'
    });
  }
  
  // Generate insights for slow scripts
  if (slowResourcesByType.script && slowResourcesByType.script.length > 0) {
    insights.push({
      id: 'slow-scripts',
      title: 'Slow JavaScript Execution',
      description: `${slowResourcesByType.script.length} scripts are taking too long to load or execute.`,
      category: 'resources',
      severity: 'critical',
      recommendation: 'Minimize and split JavaScript bundles, use async/defer attributes, and implement code splitting.',
      impact: 'Slow scripts directly impact FID, TTI, and overall interactivity.'
    });
  }
  
  // Generate insights for too many resources
  if (resources.length > 50) {
    insights.push({
      id: 'too-many-requests',
      title: 'Too Many Resource Requests',
      description: `Your page makes ${resources.length} resource requests, which is excessive.`,
      category: 'resources',
      severity: 'warning',
      recommendation: 'Bundle assets, use HTTP/2, implement resource hints (preconnect, preload), and remove unused resources.',
      impact: 'Each request adds overhead and can delay page rendering.'
    });
  }
  
  return insights;
}

/**
 * Generates insights based on page load metrics
 */
export function generatePageLoadInsights(metrics: PageLoadMetrics): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];
  
  // Define thresholds based on classifyLoadTime
  const LOAD_TIME_THRESHOLDS = {
    poor: 5000, // 5 seconds is considered poor
    moderate: 3000 // 3 seconds is considered moderate
  };
  
  // Check overall load time
  if (metrics.loadTime > LOAD_TIME_THRESHOLDS.poor) {
    insights.push({
      id: 'slow-page-load',
      title: 'Slow Page Load Time',
      description: `Your page load time of ${metrics.loadTime.toFixed(2)}ms is significantly higher than recommended.`,
      category: 'pageLoad',
      severity: 'critical',
      metrics: ['loadTime'],
      recommendation: 'Reduce page weight, optimize critical rendering path, and implement performance budgets.',
      impact: 'Slow page loads lead to higher bounce rates and reduced user engagement.'
    });
  }
  
  // Check DOM Content Loaded time
  if (metrics.domContentLoaded > 2000) {
    insights.push({
      id: 'slow-dom-content',
      title: 'Slow DOM Content Loading',
      description: `Your DOM content loaded time of ${metrics.domContentLoaded.toFixed(2)}ms indicates rendering issues.`,
      category: 'pageLoad',
      severity: 'warning',
      metrics: ['domContentLoaded'],
      recommendation: 'Minimize render-blocking resources and optimize HTML structure.',
      impact: 'Slow DOM content loading delays when users can see and interact with page content.'
    });
  }
  
  // Check time to interactive
  if (metrics.timeToInteractive > 3500) {
    insights.push({
      id: 'slow-tti',
      title: 'Slow Time to Interactive',
      description: `Your page takes ${metrics.timeToInteractive.toFixed(2)}ms to become fully interactive.`,
      category: 'pageLoad',
      severity: 'critical',
      metrics: ['timeToInteractive'],
      recommendation: 'Reduce JavaScript execution time, minimize main thread work, and implement progressive enhancement.',
      impact: 'Users may try to interact with elements before they\'re ready, causing frustration.'
    });
  }
  
  return insights;
}

/**
 * Combines all insights and sorts them by severity
 */
export function generatePerformanceInsights(
  webVitals: WebVitalMetric[],
  resources: ResourceMetric[],
  pageLoadMetrics: PageLoadMetrics
): PerformanceInsight[] {
  // Collect all insights
  const allInsights = [
    ...generateWebVitalsInsights(webVitals),
    ...generateResourceInsights(resources),
    ...generatePageLoadInsights(pageLoadMetrics)
  ];
  
  // Sort by severity: critical first, then warnings, then info
  const severityOrder: Record<InsightSeverity, number> = {
    'critical': 0,
    'warning': 1,
    'info': 2
  };
  
  return allInsights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
} 