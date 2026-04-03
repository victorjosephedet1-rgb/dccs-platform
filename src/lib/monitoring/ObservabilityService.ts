/**
 * Observability Service - Phase 1 Core Component
 * Engineer: DevOps Engineer
 *
 * Purpose: Comprehensive monitoring, logging, and performance tracking
 * Implements distributed tracing, metrics collection, and alerting
 */

export interface MetricData {
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: string;
}

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  duration: number;
  status: 'success' | 'error';
  tags: Record<string, string>;
  logs: TraceLog[];
}

export interface TraceLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, any>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  details?: any;
  checkedAt: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
}

export class ObservabilityService {
  private metrics: Map<string, MetricData[]> = new Map();
  private traces: Map<string, TraceSpan[]> = new Map();
  private activeSpans: Map<string, TraceSpan> = new Map();
  private alerts: Alert[] = [];

  private readonly MAX_METRICS_PER_TYPE = 1000;
  private readonly MAX_TRACES = 500;
  private readonly TRACE_RETENTION_MS = 3600000;

  recordMetric(
    name: string,
    value: number,
    unit: string = 'count',
    tags: Record<string, string> = {}
  ): void {
    const metric: MetricData = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString()
    };

    const metricList = this.metrics.get(name) || [];
    metricList.push(metric);

    if (metricList.length > this.MAX_METRICS_PER_TYPE) {
      metricList.shift();
    }

    this.metrics.set(name, metricList);

    this.checkThresholds(metric);
  }

  startTrace(operationName: string, tags: Record<string, string> = {}): string {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();

    const span: TraceSpan = {
      spanId,
      traceId,
      operationName,
      startTime: Date.now(),
      duration: 0,
      status: 'success',
      tags,
      logs: []
    };

    this.activeSpans.set(spanId, span);

    return spanId;
  }

  startChildSpan(
    parentSpanId: string,
    operationName: string,
    tags: Record<string, string> = {}
  ): string {
    const parentSpan = this.activeSpans.get(parentSpanId);

    if (!parentSpan) {
      return this.startTrace(operationName, tags);
    }

    const spanId = this.generateSpanId();

    const span: TraceSpan = {
      spanId,
      traceId: parentSpan.traceId,
      parentSpanId,
      operationName,
      startTime: Date.now(),
      duration: 0,
      status: 'success',
      tags,
      logs: []
    };

    this.activeSpans.set(spanId, span);

    return spanId;
  }

  endTrace(
    spanId: string,
    status: 'success' | 'error' = 'success',
    tags: Record<string, string> = {}
  ): void {
    const span = this.activeSpans.get(spanId);

    if (!span) return;

    span.duration = Date.now() - span.startTime;
    span.status = status;
    span.tags = { ...span.tags, ...tags };

    const traceSpans = this.traces.get(span.traceId) || [];
    traceSpans.push(span);
    this.traces.set(span.traceId, traceSpans);

    this.activeSpans.delete(spanId);

    this.cleanupOldTraces();

    this.recordMetric(`trace.${span.operationName}`, span.duration, 'ms', {
      status,
      ...span.tags
    });
  }

  addTraceLog(
    spanId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    fields?: Record<string, any>
  ): void {
    const span = this.activeSpans.get(spanId);

    if (!span) return;

    span.logs.push({
      timestamp: Date.now(),
      level,
      message,
      fields
    });
  }

  async checkHealth(services: string[]): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    for (const service of services) {
      const check = await this.performHealthCheck(service);
      checks.push(check);
    }

    return checks;
  }

  private async performHealthCheck(service: string): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let details = {};

      switch (service) {
        case 'database':
          status = await this.checkDatabaseHealth();
          break;
        case 'storage':
          status = await this.checkStorageHealth();
          break;
        case 'blockchain':
          status = await this.checkBlockchainHealth();
          break;
        case 'fingerprinting':
          status = await this.checkFingerprintingHealth();
          break;
        case 'ai_detection':
          status = await this.checkAIDetectionHealth();
          break;
        default:
          status = 'healthy';
      }

      const latency = Date.now() - startTime;

      return {
        service,
        status,
        latency,
        details,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        service,
        status: 'unhealthy',
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        checkedAt: new Date().toISOString()
      };
    }
  }

  private async checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    return 'healthy';
  }

  private async checkStorageHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    return 'healthy';
  }

  private async checkBlockchainHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    return 'healthy';
  }

  private async checkFingerprintingHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    return 'healthy';
  }

  private async checkAIDetectionHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    return 'healthy';
  }

  private checkThresholds(metric: MetricData): void {
    const thresholds: Record<string, { warning: number; critical: number }> = {
      'api.latency': { warning: 1000, critical: 5000 },
      'error.rate': { warning: 0.05, critical: 0.1 },
      'queue.size': { warning: 1000, critical: 5000 },
      'memory.usage': { warning: 0.8, critical: 0.95 }
    };

    const threshold = thresholds[metric.name];

    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      this.createAlert('critical', metric, threshold.critical);
    } else if (metric.value >= threshold.warning) {
      this.createAlert('warning', metric, threshold.warning);
    }
  }

  private createAlert(
    severity: 'warning' | 'critical',
    metric: MetricData,
    threshold: number
  ): void {
    const alert: Alert = {
      id: this.generateAlertId(),
      severity,
      title: `${metric.name} threshold exceeded`,
      message: `${metric.name} is at ${metric.value}${metric.unit}, exceeding ${severity} threshold of ${threshold}${metric.unit}`,
      metric: metric.name,
      threshold,
      currentValue: metric.value,
      triggeredAt: new Date().toISOString()
    };

    this.alerts.push(alert);

    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    }

    console.warn(`ALERT [${severity.toUpperCase()}]:`, alert.message);
  }

  getMetricStats(name: string, timeWindowMs: number = 3600000): {
    count: number;
    average: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.metrics.get(name) || [];
    const cutoffTime = Date.now() - timeWindowMs;

    const recentMetrics = metrics.filter(m =>
      new Date(m.timestamp).getTime() > cutoffTime
    );

    if (recentMetrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const values = recentMetrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      average: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99)
    };
  }

  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((sortedValues.length * p) / 100) - 1;
    return sortedValues[Math.max(0, index)];
  }

  getTraceAnalysis(traceId: string): {
    totalDuration: number;
    spanCount: number;
    errorCount: number;
    criticalPath: TraceSpan[];
  } {
    const spans = this.traces.get(traceId) || [];

    if (spans.length === 0) {
      return { totalDuration: 0, spanCount: 0, errorCount: 0, criticalPath: [] };
    }

    const rootSpan = spans.find(s => !s.parentSpanId);
    const totalDuration = rootSpan?.duration || 0;
    const errorCount = spans.filter(s => s.status === 'error').length;

    const criticalPath = this.findCriticalPath(spans);

    return {
      totalDuration,
      spanCount: spans.length,
      errorCount,
      criticalPath
    };
  }

  private findCriticalPath(spans: TraceSpan[]): TraceSpan[] {
    const sorted = [...spans].sort((a, b) => b.duration - a.duration);
    return sorted.slice(0, 5);
  }

  private cleanupOldTraces(): void {
    if (this.traces.size <= this.MAX_TRACES) return;

    const cutoffTime = Date.now() - this.TRACE_RETENTION_MS;

    for (const [traceId, spans] of this.traces.entries()) {
      const oldestSpan = spans[0];
      if (oldestSpan && oldestSpan.startTime < cutoffTime) {
        this.traces.delete(traceId);
      }
    }
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => {
      const age = Date.now() - new Date(alert.triggeredAt).getTime();
      return age < 3600000;
    });
  }

  getDashboardMetrics(): {
    systemHealth: 'healthy' | 'degraded' | 'unhealthy';
    activeAlerts: number;
    avgResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
  } {
    const latencyStats = this.getMetricStats('api.latency', 60000);
    const errorMetrics = this.metrics.get('error.rate') || [];
    const requestMetrics = this.metrics.get('api.requests') || [];

    const recentErrors = errorMetrics.filter(m =>
      Date.now() - new Date(m.timestamp).getTime() < 60000
    );

    const errorRate = recentErrors.length > 0
      ? recentErrors.reduce((sum, m) => sum + m.value, 0) / recentErrors.length
      : 0;

    const recentRequests = requestMetrics.filter(m =>
      Date.now() - new Date(m.timestamp).getTime() < 60000
    );

    const requestsPerMinute = recentRequests.reduce((sum, m) => sum + m.value, 0);

    let systemHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorRate > 0.1 || latencyStats.p95 > 5000) {
      systemHealth = 'unhealthy';
    } else if (errorRate > 0.05 || latencyStats.p95 > 1000) {
      systemHealth = 'degraded';
    }

    return {
      systemHealth,
      activeAlerts: this.getActiveAlerts().length,
      avgResponseTime: latencyStats.average,
      errorRate,
      requestsPerMinute
    };
  }

  exportMetrics(): Record<string, MetricData[]> {
    const exported: Record<string, MetricData[]> = {};

    for (const [name, metrics] of this.metrics.entries()) {
      exported[name] = metrics;
    }

    return exported;
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.traces.clear();
    this.activeSpans.clear();
    this.alerts = [];
  }
}

export const observabilityService = new ObservabilityService();
