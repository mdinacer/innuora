/**
 * Performance Monitoring System
 *
 * Tracks system performance, errors, and operational metrics
 * for production observability and business intelligence.
 */

import { analytics } from './analytics';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | '%';
  timestamp: Date;
}

interface ErrorMetric {
  error: Error;
  context: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class PerformanceMonitor {
  private startTimes: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  startTimer(operationName: string): void {
    this.startTimes.set(operationName, performance.now());
  }

  /**
   * End timing and record metric
   */
  endTimer(operationName: string, metadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(operationName);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operationName);

    // Track performance metric
    this.recordMetric({
      name: operationName,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
    }, metadata);

    return duration;
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric, metadata?: Record<string, any>): void {
    // Track performance for analytics
    analytics.track('feature_used', {
      feature: 'performance',
      action: metric.name,
      metadata: {
        ...metadata,
        value: metric.value,
        unit: metric.unit,
        performanceEntry: true,
      },
    });

    // Log slow operations for monitoring
    if (metric.unit === 'ms' && metric.value > 5000) { // Operations taking more than 5 seconds
      console.warn(`Slow operation detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  /**
   * Record an error with context
   */
  recordError(errorMetric: ErrorMetric): void {
    analytics.trackError(errorMetric.error, {
      userId: errorMetric.userId,
      sessionId: errorMetric.sessionId,
      metadata: {
        context: errorMetric.context,
        severity: errorMetric.severity,
        errorType: errorMetric.error.name,
        timestamp: new Date().toISOString(),
      },
    });

    // Log critical errors immediately
    if (errorMetric.severity === 'critical') {
      console.error('CRITICAL ERROR:', {
        error: errorMetric.error.message,
        context: errorMetric.context,
        stack: errorMetric.error.stack,
      });
    }
  }

  /**
   * Monitor Web Vitals (Core Web Vitals for user experience)
   */
  trackWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.recordMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        });

        this.recordMetric({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        });
      }
    });

    // Track largest contentful paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          if (lastEntry) {
            this.recordMetric({
              name: 'largest_contentful_paint',
              value: lastEntry.startTime,
              unit: 'ms',
              timestamp: new Date(),
            });
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        // Some browsers might not support all performance APIs
        console.warn('Performance observer not fully supported');
      }
    }
  }

  /**
   * Track API response times
   */
  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.recordMetric({
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
    }, {
      endpoint,
      method,
      status,
      isSuccess: status >= 200 && status < 300,
    });
  }

  /**
   * Track memory usage (if available)
   */
  trackMemoryUsage(): void {
    if (typeof window === 'undefined') return;

    const memory = (performance as any).memory;
    if (memory) {
      this.recordMetric({
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: new Date(),
      }, {
        totalHeapSize: memory.totalJSHeapSize,
        heapLimit: memory.jsHeapSizeLimit,
      });
    }
  }

  /**
   * Measure and track a function execution time
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(operationName);

    try {
      const result = await operation();
      this.endTimer(operationName, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(operationName, { ...metadata, success: false });

      this.recordError({
        error: error as Error,
        context: operationName,
        severity: 'medium',
      });

      throw error;
    }
  }

  /**
   * Measure and track a synchronous function execution time
   */
  measure<T>(
    operationName: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startTimer(operationName);

    try {
      const result = operation();
      this.endTimer(operationName, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(operationName, { ...metadata, success: false });

      this.recordError({
        error: error as Error,
        context: operationName,
        severity: 'medium',
      });

      throw error;
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startTimer = (operation: string) => performanceMonitor.startTimer(operation);
export const endTimer = (operation: string, metadata?: Record<string, any>) => performanceMonitor.endTimer(operation, metadata);
export const recordError = (error: Error, context: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') =>
  performanceMonitor.recordError({ error, context, severity });
export const measureAsync = <T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>) =>
  performanceMonitor.measureAsync(name, fn, metadata);
export const measure = <T>(name: string, fn: () => T, metadata?: Record<string, any>) =>
  performanceMonitor.measure(name, fn, metadata);

// Auto-initialize web vitals tracking in browser
if (typeof window !== 'undefined') {
  performanceMonitor.trackWebVitals();

  // Track memory usage periodically (every 5 minutes)
  setInterval(() => {
    performanceMonitor.trackMemoryUsage();
  }, 5 * 60 * 1000);
}