// ─── libs/common/src/tracing/traceContext.ts ────────────────────────────────
// Attaches / extracts W3C traceparent from Redis RPC payloads and BullMQ job
// data. @nestjs/microservices does not propagate trace context automatically.
// §10 of TridopAI-Microservices-Architecture.md.

import { context, propagation, trace } from '@opentelemetry/api';

const TRACE_KEY = '__traceparent';

/**
 * Attach current trace context to an outgoing Redis RPC payload or BullMQ
 * job data object. Call this in BaseServiceClient before every .send().
 */
export function attachTraceContext<T extends Record<string, unknown>>(
  payload: T,
): T & { [TRACE_KEY]: string } {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return { ...payload, [TRACE_KEY]: carrier.traceparent ?? '' };
}

/**
 * Extract and restore trace context from an incoming Redis RPC payload or
 * BullMQ job data. Call this at the top of every @MessagePattern handler
 * or BullMQ Processor that needs the span linked to its caller.
 */
export function extractTraceContext(
  payload: Record<string, unknown>,
): ReturnType<typeof context.active> {
  const carrier: Record<string, string> = {};
  if (typeof payload[TRACE_KEY] === 'string') {
    carrier.traceparent = payload[TRACE_KEY];
  }
  return propagation.extract(context.active(), carrier);
}

/** Convenience: get the current span's trace ID as a hex string. */
export function currentTraceId(): string {
  return trace.getActiveSpan()?.spanContext().traceId ?? '';
}
