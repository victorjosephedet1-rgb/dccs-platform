/**
 * V3BMusic.AI - Unified Payment Router
 * World's fastest payment processing: 2-5 seconds
 *
 * Supports:
 * - Stripe (Visa, Mastercard, all cards)
 * - Blockchain (Ethereum, Polygon, BSC)
 * - Cryptocurrency (USDC, USDT, ETH)
 * - AI-powered route optimization
 */

import { supabase } from './supabase';

export type PaymentMethod = 'auto' | 'stripe' | 'crypto' | 'blockchain';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'redirect_required';

export interface PaymentRequest {
  productType: 'track' | 'pack' | 'subscription';
  productId: string;
  amount: number;
  currency?: string;
  preferredMethod?: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  transactionHash?: string;
  checkoutUrl?: string;
  sessionId?: string;
  network?: string;
  blockExplorer?: string;
  performance: {
    totalTimeMs: number;
    totalTimeSeconds: string;
    isInstant: boolean;
    worldRecord: boolean;
  };
  route: {
    method: string;
    estimatedTime: number;
    estimatedCost: number;
    reliability: number;
    reason: string;
  };
  error?: string;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  transactionId?: string;
  transactionHash?: string;
  completedAt?: string;
  amount?: number;
  currency?: string;
  method?: string;
}

/**
 * Unified Payment Router
 * Handles all payment methods with AI optimization
 */
export class PaymentRouter {

  /**
   * Process payment with optimal routing
   * Automatically selects fastest, cheapest, most reliable method
   */
  static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const startTime = performance.now();

      console.log('💳 Initiating payment:', {
        amount: request.amount,
        currency: request.currency || 'GBP',
        method: request.preferredMethod || 'auto'
      });

      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Authentication required. Please log in to continue.');
      }

      // Call unified payment router edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unified-payment-router`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }

      const result: PaymentResult = await response.json();

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log('✅ Payment processed:', {
        method: result.method,
        time: `${totalTime.toFixed(0)}ms`,
        worldRecord: totalTime < 2000
      });

      // If Stripe checkout, redirect immediately (with security validation)
      if (result.status === 'redirect_required' && result.checkoutUrl) {
        console.log('🔄 Redirecting to Stripe checkout...');

        // Security: Validate URL is from Stripe domain
        try {
          const url = new URL(result.checkoutUrl);
          if (!url.hostname.endsWith('stripe.com')) {
            throw new Error('Invalid checkout URL: not from Stripe domain');
          }
          window.location.href = result.checkoutUrl;
        } catch (error) {
          console.error('❌ Invalid checkout URL:', error);
          throw new Error('Payment redirect failed: invalid URL');
        }
      }

      return result;

    } catch (error) {
      console.error('❌ Payment failed:', error);

      return {
        success: false,
        method: 'unknown',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment processing failed',
        performance: {
          totalTimeMs: 0,
          totalTimeSeconds: '0.00',
          isInstant: false,
          worldRecord: false,
        },
        route: {
          method: 'unknown',
          estimatedTime: 0,
          estimatedCost: 0,
          reliability: 0,
          reason: 'Error occurred',
        },
      };
    }
  }

  /**
   * Quick Stripe checkout (traditional card payment)
   */
  static async quickStripeCheckout(request: PaymentRequest): Promise<PaymentResult> {
    return this.processPayment({
      ...request,
      preferredMethod: 'stripe',
    });
  }

  /**
   * Quick crypto payment (USDC, USDT, ETH)
   */
  static async quickCryptoPayment(request: PaymentRequest): Promise<PaymentResult> {
    return this.processPayment({
      ...request,
      preferredMethod: 'crypto',
    });
  }

  /**
   * Check payment status in real-time
   */
  static async getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required');
      }

      // Check universal transactions table
      const { data: transaction, error } = await supabase
        .from('universal_transactions')
        .select('*')
        .or(`id.eq.${transactionId},metadata->>transactionHash.eq.${transactionId}`)
        .maybeSingle();

      if (error || !transaction) {
        return {
          status: 'failed',
        };
      }

      return {
        status: transaction.status as PaymentStatus,
        transactionId: transaction.id,
        transactionHash: transaction.metadata?.transactionHash,
        completedAt: transaction.completed_at,
        amount: transaction.amount,
        currency: transaction.currency,
        method: transaction.method,
      };

    } catch (error) {
      console.error('Failed to get payment status:', error);
      return {
        status: 'failed',
      };
    }
  }

  /**
   * Verify blockchain transaction
   */
  static async verifyBlockchainTransaction(txHash: string): Promise<{
    verified: boolean;
    confirmations: number;
    status: PaymentStatus;
  }> {
    try {
      const { data: transaction } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('transaction_hash', txHash)
        .maybeSingle();

      if (!transaction) {
        return {
          verified: false,
          confirmations: 0,
          status: 'failed',
        };
      }

      return {
        verified: true,
        confirmations: transaction.confirmations || 0,
        status: transaction.status as PaymentStatus,
      };

    } catch (error) {
      console.error('Failed to verify transaction:', error);
      return {
        verified: false,
        confirmations: 0,
        status: 'failed',
      };
    }
  }

  /**
   * Get supported payment methods for user
   */
  static async getSupportedMethods(): Promise<{
    stripe: boolean;
    crypto: boolean;
    blockchain: boolean;
    hasWallet: boolean;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          stripe: true,
          crypto: false,
          blockchain: false,
          hasWallet: false,
        };
      }

      // Check if user has verified crypto wallet
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('id, is_verified')
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .maybeSingle();

      const hasWallet = !!wallet;

      return {
        stripe: true,
        crypto: hasWallet,
        blockchain: hasWallet,
        hasWallet,
      };

    } catch (error) {
      console.error('Failed to get supported methods:', error);
      return {
        stripe: true,
        crypto: false,
        blockchain: false,
        hasWallet: false,
      };
    }
  }

  /**
   * Estimate payment time and cost
   */
  static async estimatePayment(amount: number, method: PaymentMethod = 'auto'): Promise<{
    estimatedTime: string;
    estimatedCost: number;
    recommendedMethod: string;
    breakdown: Array<{
      method: string;
      time: string;
      cost: number;
      recommended: boolean;
    }>;
  }> {
    const methods = [
      {
        method: 'stripe',
        time: '1-2 seconds',
        cost: amount * 0.014 + 0.20,
        recommended: amount > 10,
      },
      {
        method: 'crypto',
        time: '2-3 seconds',
        cost: 0.001,
        recommended: amount < 1,
      },
      {
        method: 'blockchain',
        time: '3-5 seconds',
        cost: 0.002,
        recommended: amount >= 1 && amount <= 10,
      },
    ];

    const recommended = methods.find(m => m.recommended) || methods[0];

    return {
      estimatedTime: recommended.time,
      estimatedCost: recommended.cost,
      recommendedMethod: recommended.method,
      breakdown: methods,
    };
  }
}

/**
 * Real-time payment tracking
 */
export class PaymentTracker {
  private static listeners: Map<string, (status: PaymentStatusResponse) => void> = new Map();

  /**
   * Subscribe to payment status updates
   */
  static subscribe(
    transactionId: string,
    callback: (status: PaymentStatusResponse) => void
  ): () => void {
    this.listeners.set(transactionId, callback);

    // Poll for status updates every 2 seconds
    const intervalId = setInterval(async () => {
      const status = await PaymentRouter.getPaymentStatus(transactionId);
      callback(status);

      // Stop polling if completed or failed
      if (status.status === 'completed' || status.status === 'failed') {
        this.unsubscribe(transactionId);
        clearInterval(intervalId);
      }
    }, 2000);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(transactionId);
      clearInterval(intervalId);
    };
  }

  /**
   * Unsubscribe from payment updates
   */
  static unsubscribe(transactionId: string): void {
    this.listeners.delete(transactionId);
  }
}

/**
 * Payment analytics and insights
 */
export class PaymentAnalytics {

  /**
   * Get user payment statistics
   */
  static async getUserStats(userId: string): Promise<{
    totalSpent: number;
    totalTransactions: number;
    averageAmount: number;
    preferredMethod: string;
    averageProcessingTime: number;
  }> {
    try {
      const { data: transactions } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'payment')
        .order('created_at', { ascending: false });

      if (!transactions || transactions.length === 0) {
        return {
          totalSpent: 0,
          totalTransactions: 0,
          averageAmount: 0,
          preferredMethod: 'stripe',
          averageProcessingTime: 0,
        };
      }

      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const averageAmount = totalSpent / transactions.length;

      // Calculate preferred method (most used)
      const methodCounts: Record<string, number> = {};
      transactions.forEach(tx => {
        methodCounts[tx.method] = (methodCounts[tx.method] || 0) + 1;
      });
      const preferredMethod = Object.entries(methodCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'stripe';

      // Calculate average processing time
      const totalTime = transactions.reduce((sum, tx) => sum + (tx.processing_time_ms || 0), 0);
      const averageProcessingTime = totalTime / transactions.length;

      return {
        totalSpent,
        totalTransactions: transactions.length,
        averageAmount,
        preferredMethod,
        averageProcessingTime,
      };

    } catch (error) {
      console.error('Failed to get payment stats:', error);
      return {
        totalSpent: 0,
        totalTransactions: 0,
        averageAmount: 0,
        preferredMethod: 'stripe',
        averageProcessingTime: 0,
      };
    }
  }
}
