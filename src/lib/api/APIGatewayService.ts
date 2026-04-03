/**
 * API Gateway Service - Phase 1 Core Component
 * Engineer: Integration Specialist
 *
 * Purpose: Unified API gateway for all DCCS services
 * Implements rate limiting, request routing, validation, and circuit breakers
 */

export interface APIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  tier: 'free' | 'premium' | 'enterprise';
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringWindow: number;
}

export class APIGatewayService {
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private requestLog: RequestLog[] = [];

  private readonly API_VERSION = 'v1';
  private readonly MAX_LOG_SIZE = 10000;

  async handleRequest<T = any>(request: APIRequest, userId?: string): Promise<APIResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const validationResult = this.validateRequest(request);
      if (!validationResult.valid) {
        return this.errorResponse(requestId, 'VALIDATION_ERROR', validationResult.error || 'Invalid request');
      }

      if (userId) {
        const rateLimitResult = await this.checkRateLimit(userId, request.endpoint);
        if (!rateLimitResult.allowed) {
          return this.errorResponse(requestId, 'RATE_LIMIT_EXCEEDED', 'Too many requests', {
            retryAfter: rateLimitResult.retryAfter
          });
        }
      }

      const circuitBreaker = this.getCircuitBreaker(request.endpoint);
      if (circuitBreaker.isOpen()) {
        return this.errorResponse(requestId, 'SERVICE_UNAVAILABLE', 'Service temporarily unavailable');
      }

      const response = await circuitBreaker.execute(() => this.routeRequest<T>(request));

      const executionTime = Date.now() - startTime;
      this.logRequest(requestId, request, response, executionTime, userId);

      return {
        success: true,
        data: response,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: this.API_VERSION
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResponse = this.errorResponse(
        requestId,
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );

      this.logRequest(requestId, request, errorResponse, executionTime, userId);

      return errorResponse;
    }
  }

  private async routeRequest<T>(request: APIRequest): Promise<T> {
    const { endpoint, method, body, params } = request;

    const routes: Record<string, () => Promise<any>> = {
      'POST /api/v1/fingerprint/generate': () => this.handleFingerprintGeneration(body),
      'POST /api/v1/fingerprint/search': () => this.handleFingerprintSearch(body),
      'POST /api/v1/ai/scan': () => this.handleContentScan(body),
      'GET /api/v1/ai/scan/:id': () => this.handleGetScan(params?.id),
      'POST /api/v1/platform/detect': () => this.handlePlatformDetection(body),
      'GET /api/v1/platform/stats/:code': () => this.handleGetPlatformStats(params?.code),
      'POST /api/v1/blockchain/anchor': () => this.handleBlockchainAnchor(body),
      'GET /api/v1/blockchain/verify/:id': () => this.handleBlockchainVerify(params?.id),
      'GET /api/v1/certificate/:code': () => this.handleGetCertificate(params?.code),
      'POST /api/v1/certificate/create': () => this.handleCreateCertificate(body),
    };

    const routeKey = `${method} ${endpoint}`;
    const handler = routes[routeKey];

    if (!handler) {
      throw new Error(`Route not found: ${routeKey}`);
    }

    return await handler();
  }

  private validateRequest(request: APIRequest): { valid: boolean; error?: string } {
    if (!request.endpoint || !request.method) {
      return { valid: false, error: 'Missing required fields: endpoint or method' };
    }

    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!allowedMethods.includes(request.method)) {
      return { valid: false, error: 'Invalid HTTP method' };
    }

    if (request.endpoint.length > 500) {
      return { valid: false, error: 'Endpoint path too long' };
    }

    if (request.body && typeof request.body === 'object') {
      const bodySize = JSON.stringify(request.body).length;
      if (bodySize > 10 * 1024 * 1024) {
        return { valid: false, error: 'Request body too large (max 10MB)' };
      }
    }

    return { valid: true };
  }

  private async checkRateLimit(userId: string, endpoint: string): Promise<{
    allowed: boolean;
    retryAfter?: number;
  }> {
    const limiterKey = `${userId}:${endpoint}`;
    let limiter = this.rateLimiters.get(limiterKey);

    if (!limiter) {
      limiter = new RateLimiter({
        maxRequests: 100,
        windowMs: 60000,
        tier: 'free'
      });
      this.rateLimiters.set(limiterKey, limiter);
    }

    return limiter.checkLimit();
  }

  private getCircuitBreaker(endpoint: string): CircuitBreaker {
    let breaker = this.circuitBreakers.get(endpoint);

    if (!breaker) {
      breaker = new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringWindow: 120000
      });
      this.circuitBreakers.set(endpoint, breaker);
    }

    return breaker;
  }

  private errorResponse(
    requestId: string,
    code: string,
    message: string,
    details?: any
  ): APIResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logRequest(
    requestId: string,
    request: APIRequest,
    response: APIResponse,
    executionTime: number,
    userId?: string
  ): void {
    this.requestLog.push({
      requestId,
      userId,
      endpoint: request.endpoint,
      method: request.method,
      success: response.success,
      executionTime,
      timestamp: new Date().toISOString()
    });

    if (this.requestLog.length > this.MAX_LOG_SIZE) {
      this.requestLog = this.requestLog.slice(-5000);
    }
  }

  private async handleFingerprintGeneration(body: any): Promise<any> {
    return { message: 'Fingerprint generation endpoint' };
  }

  private async handleFingerprintSearch(body: any): Promise<any> {
    return { message: 'Fingerprint search endpoint' };
  }

  private async handleContentScan(body: any): Promise<any> {
    return { message: 'Content scan endpoint' };
  }

  private async handleGetScan(id?: string): Promise<any> {
    return { message: 'Get scan endpoint', id };
  }

  private async handlePlatformDetection(body: any): Promise<any> {
    return { message: 'Platform detection endpoint' };
  }

  private async handleGetPlatformStats(code?: string): Promise<any> {
    return { message: 'Get platform stats endpoint', code };
  }

  private async handleBlockchainAnchor(body: any): Promise<any> {
    return { message: 'Blockchain anchor endpoint' };
  }

  private async handleBlockchainVerify(id?: string): Promise<any> {
    return { message: 'Blockchain verify endpoint', id };
  }

  private async handleGetCertificate(code?: string): Promise<any> {
    return { message: 'Get certificate endpoint', code };
  }

  private async handleCreateCertificate(body: any): Promise<any> {
    return { message: 'Create certificate endpoint' };
  }

  getRequestStats(): {
    totalRequests: number;
    successRate: number;
    averageExecutionTime: number;
    requestsByEndpoint: Record<string, number>;
  } {
    const totalRequests = this.requestLog.length;
    const successfulRequests = this.requestLog.filter(log => log.success).length;
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;

    const executionTimes = this.requestLog.map(log => log.executionTime);
    const averageExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;

    const requestsByEndpoint = this.requestLog.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests,
      successRate,
      averageExecutionTime,
      requestsByEndpoint
    };
  }
}

class RateLimiter {
  private requests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.config.windowMs);

    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const retryAfter = Math.ceil((oldestRequest + this.config.windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    this.requests.push(now);
    return { allowed: true };
  }
}

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  isOpen(): boolean {
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.config.resetTimeout) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}

interface RequestLog {
  requestId: string;
  userId?: string;
  endpoint: string;
  method: string;
  success: boolean;
  executionTime: number;
  timestamp: string;
}

export const apiGatewayService = new APIGatewayService();
