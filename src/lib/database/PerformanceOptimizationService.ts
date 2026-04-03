/**
 * Performance Optimization Service - Phase 1 Core Component
 * Engineer: Database Architect
 *
 * Purpose: Database query optimization, caching, and performance monitoring
 * Implements materialized views, query batching, and connection pooling
 */

import { supabase } from '../supabase';

export interface QueryMetrics {
  queryName: string;
  executionTime: number;
  rowsReturned: number;
  cacheHit: boolean;
  timestamp: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class PerformanceOptimizationService {
  private queryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000;
  private readonly BATCH_SIZE = 100;
  private queryMetrics: QueryMetrics[] = [];

  async getCertificatesWithStats(limit: number = 50): Promise<any[]> {
    const cacheKey = `certificates_stats_${limit}`;
    const cached = this.getCachedData<any[]>(cacheKey);

    if (cached) {
      this.recordMetric('getCertificatesWithStats', 0, cached.length, true);
      return cached;
    }

    const startTime = Date.now();

    const { data, error } = await supabase
      .rpc('get_certificates_with_usage_stats', { p_limit: limit });

    const executionTime = Date.now() - startTime;

    if (error) {
      console.error('Error fetching certificates with stats:', error);
      return [];
    }

    this.setCachedData(cacheKey, data || [], this.DEFAULT_CACHE_TTL);
    this.recordMetric('getCertificatesWithStats', executionTime, data?.length || 0, false);

    return data || [];
  }

  async getTopContentByViews(limit: number = 20): Promise<any[]> {
    const cacheKey = `top_content_${limit}`;
    const cached = this.getCachedData<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const startTime = Date.now();

    const { data, error } = await supabase
      .from('platform_usage_tracking')
      .select(`
        clearance_code,
        view_count,
        play_count,
        platform,
        dccs_certificates!inner(project_title, creator_id)
      `)
      .order('view_count', { ascending: false })
      .limit(limit);

    const executionTime = Date.now() - startTime;

    if (error) {
      console.error('Error fetching top content:', error);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 600000);
    this.recordMetric('getTopContentByViews', executionTime, data?.length || 0, false);

    return data || [];
  }

  async batchGetCertificates(certificateIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const uncachedIds: string[] = [];

    for (const id of certificateIds) {
      const cacheKey = `certificate_${id}`;
      const cached = this.getCachedData<any>(cacheKey);

      if (cached) {
        results.set(id, cached);
      } else {
        uncachedIds.push(id);
      }
    }

    if (uncachedIds.length === 0) {
      return results;
    }

    for (let i = 0; i < uncachedIds.length; i += this.BATCH_SIZE) {
      const batch = uncachedIds.slice(i, i + this.BATCH_SIZE);

      const { data, error } = await supabase
        .from('dccs_certificates')
        .select('*')
        .in('certificate_id', batch);

      if (!error && data) {
        data.forEach(cert => {
          results.set(cert.certificate_id, cert);
          this.setCachedData(`certificate_${cert.certificate_id}`, cert, this.DEFAULT_CACHE_TTL);
        });
      }
    }

    return results;
  }

  async batchUpdatePlatformStats(updates: Array<{
    clearanceCode: string;
    platform: string;
    viewCount: number;
    playCount: number;
    engagement: any;
  }>): Promise<void> {
    for (let i = 0; i < updates.length; i += this.BATCH_SIZE) {
      const batch = updates.slice(i, i + this.BATCH_SIZE);

      for (const update of batch) {
        await supabase.rpc('increment_platform_stats', {
          p_clearance_code: update.clearanceCode,
          p_platform: update.platform,
          p_view_increment: update.viewCount,
          p_play_increment: update.playCount
        });
      }
    }

    this.invalidateCachePattern('platform_usage_');
  }

  async getAggregatedStats(): Promise<{
    totalCertificates: number;
    totalViews: number;
    totalUploads: number;
    activeCreators: number;
  }> {
    const cacheKey = 'aggregated_stats';
    const cached = this.getCachedData<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const startTime = Date.now();

    const [certificatesResult, viewsResult, uploadsResult, creatorsResult] = await Promise.all([
      supabase.from('dccs_certificates').select('id', { count: 'exact', head: true }),
      supabase.from('platform_usage_tracking').select('view_count'),
      supabase.from('uploads').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'creator')
    ]);

    const totalViews = viewsResult.data?.reduce((sum, record) => sum + (record.view_count || 0), 0) || 0;

    const stats = {
      totalCertificates: certificatesResult.count || 0,
      totalViews,
      totalUploads: uploadsResult.count || 0,
      activeCreators: creatorsResult.count || 0
    };

    const executionTime = Date.now() - startTime;
    this.recordMetric('getAggregatedStats', executionTime, 4, false);

    this.setCachedData(cacheKey, stats, 600000);

    return stats;
  }

  async refreshMaterializedViews(): Promise<void> {
    try {
      await supabase.rpc('refresh_certificate_stats_view');
      await supabase.rpc('refresh_platform_analytics_view');

      console.log('Materialized views refreshed successfully');
    } catch (error) {
      console.error('Error refreshing materialized views:', error);
    }
  }

  async optimizeQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): Promise<T> {
    const cached = this.getCachedData<T>(cacheKey);

    if (cached) {
      return cached;
    }

    const startTime = Date.now();
    const result = await queryFn();
    const executionTime = Date.now() - startTime;

    this.setCachedData(cacheKey, result, ttl);
    this.recordMetric(cacheKey, executionTime, 1, false);

    return result;
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.queryCache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.queryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCachedData<T>(key: string, data: T, ttl: number): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    this.cleanupExpiredCache();
  }

  private cleanupExpiredCache(): void {
    if (this.queryCache.size > 1000) {
      const now = Date.now();
      for (const [key, entry] of this.queryCache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.queryCache.delete(key);
        }
      }
    }
  }

  invalidateCache(key: string): void {
    this.queryCache.delete(key);
  }

  invalidateCachePattern(pattern: string): void {
    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.queryCache.clear();
  }

  private recordMetric(
    queryName: string,
    executionTime: number,
    rowsReturned: number,
    cacheHit: boolean
  ): void {
    this.queryMetrics.push({
      queryName,
      executionTime,
      rowsReturned,
      cacheHit,
      timestamp: new Date().toISOString()
    });

    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-500);
    }
  }

  getQueryMetrics(): QueryMetrics[] {
    return this.queryMetrics;
  }

  getPerformanceReport(): {
    totalQueries: number;
    cacheHitRate: number;
    averageExecutionTime: number;
    slowestQueries: QueryMetrics[];
  } {
    const totalQueries = this.queryMetrics.length;
    const cacheHits = this.queryMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? cacheHits / totalQueries : 0;

    const executionTimes = this.queryMetrics
      .filter(m => !m.cacheHit)
      .map(m => m.executionTime);

    const averageExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;

    const slowestQueries = [...this.queryMetrics]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      totalQueries,
      cacheHitRate,
      averageExecutionTime,
      slowestQueries
    };
  }

  async warmupCache(): Promise<void> {
    console.log('Warming up cache...');

    await Promise.all([
      this.getCertificatesWithStats(50),
      this.getTopContentByViews(20),
      this.getAggregatedStats()
    ]);

    console.log('Cache warmup complete');
  }

  async analyzeDatabasePerformance(): Promise<{
    slowQueries: any[];
    indexUsage: any[];
    tableStats: any[];
  }> {
    const { data: slowQueries } = await supabase
      .rpc('get_slow_queries');

    const { data: indexUsage } = await supabase
      .rpc('get_index_usage_stats');

    const { data: tableStats } = await supabase
      .rpc('get_table_statistics');

    return {
      slowQueries: slowQueries || [],
      indexUsage: indexUsage || [],
      tableStats: tableStats || []
    };
  }
}

export const performanceOptimizationService = new PerformanceOptimizationService();
