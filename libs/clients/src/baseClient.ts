// ─── libs/clients/src/baseClient.ts ─────────────────────────────────────────
// Every per-service client extends BaseServiceClient.
// Wraps every .send() call with:
//   1. Trace context injection (§10)
//   2. Explicit timeout — default 5 s, overridable per call site
//   3. Circuit breaker via cockatiel (Q4 decision) — opens after 5 consecutive
//      failures, half-open retry after 30 s cooldown
//
// NEVER call ClientProxy.send() directly anywhere in the codebase.
// Always use a method on a concrete *Client class that extends this.

import type { ClientProxy } from '@nestjs/microservices';
import {
  CircuitBreakerPolicy,
  ConsecutiveBreaker,
  ExponentialBackoff,
  retry,
  handleAll,
  wrap,
  circuitBreaker,
  timeout,
  TimeoutStrategy,
} from 'cockatiel';
import { firstValueFrom, timeout as rxjsTimeout } from 'rxjs';
import { attachTraceContext } from '@libs/common';

export interface SendOptions {
  /** Timeout in milliseconds. Defaults to 5 000. AI generation calls should use 60 000. */
  timeoutMs?: number;
}

export abstract class BaseServiceClient {
  protected abstract readonly proxy: ClientProxy;

  /**
   * Cockatiel circuit-breaker policy, shared across all methods on this client.
   * Opens after 5 consecutive failures; half-open retry after 30 s.
   */
  private readonly cbPolicy = circuitBreaker(handleAll, {
    halfOpenAfter: 30_000,
    breaker: new ConsecutiveBreaker(5),
  });

  /**
   * Send a request to the downstream service and await a reply.
   * Trace context is automatically injected into the payload.
   */
  protected async send<TResult, TPayload extends Record<string, unknown>>(
    pattern: string,
    payload: TPayload,
    options: SendOptions = {},
  ): Promise<TResult> {
    const { timeoutMs = 5000 } = options;

    // Inject W3C traceparent into the outgoing payload (§10)
    const tracedPayload = attachTraceContext(payload);

    return this.cbPolicy.execute(() =>
      firstValueFrom(
        this.proxy
          .send<TResult>(pattern, tracedPayload)
          .pipe(rxjsTimeout(timeoutMs)),
      ),
    );
  }
}
