// ─── libs/common/src/tracing/otel.setup.ts ──────────────────────────────────
// Called FIRST in every service's main.ts — before any other import or
// NestFactory call. §10 of TridopAI-Microservices-Architecture.md.

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let _sdk: NodeSDK | null = null;

export function initTracing(serviceName: string): void {
  if (_sdk) return; // guard against double-init

  try {
    const rawEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const url = rawEndpoint && rawEndpoint.trim().length > 0
      ? rawEndpoint.trim()
      : 'http://localhost:4318/v1/traces';

    const headers: Record<string, string> = {};
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
      process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',').forEach((header) => {
        const [k, v] = header.split('=');
        if (k && v) headers[k.trim()] = v.trim();
      });
    } else if (process.env.HONEYCOMB_API_KEY) {
      headers['x-honeycomb-team'] = process.env.HONEYCOMB_API_KEY;
    }

    const exporter = new OTLPTraceExporter({ url, headers });

    _sdk = new NodeSDK({
      serviceName,
      traceExporter: exporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    _sdk.start();

    process.on('SIGTERM', () => {
      _sdk
        ?.shutdown()
        .then(() => { console.log(`[${serviceName}] OTel SDK shut down`); })
        .catch((error) => { console.error(`[${serviceName}] OTel shutdown error`, error); });
    });
  } catch (err: any) {
    console.warn(`[${serviceName}] OpenTelemetry tracing initialization skipped: ${err.message}`);
  }
}