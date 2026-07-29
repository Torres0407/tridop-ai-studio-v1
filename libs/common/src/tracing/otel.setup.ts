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

    const exporter = new OTLPTraceExporter({ url });

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
