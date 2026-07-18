// ─── libs/common/src/tracing/otel.setup.ts ──────────────────────────────────
// Called FIRST in every service's main.ts — before any other import or
// NestFactory call. §10 of TridopAI-Microservices-Architecture.md.
//
// Design decisions (Q3):
//   • OTLP-HTTP exporter — endpoint driven by OTEL_EXPORTER_OTLP_ENDPOINT env var
//   • Defaults to http://localhost:4318/v1/traces for local dev
//   • In production, point to Sentry OTLP / Grafana Tempo / Honeycomb
//     by setting the env var — no code change required

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let _sdk: NodeSDK | null = null;

export function initTracing(serviceName: string): void {
  if (_sdk) return; // guard against double-init (e.g. in tests)

  const exporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
      'http://localhost:4318/v1/traces',
  });

  _sdk = new NodeSDK({
    serviceName,
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // avoid overly noisy fs instrumentation in dev
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  _sdk.start();

  process.on('SIGTERM', () => {
    _sdk
      ?.shutdown()
      .then(() => { console.log('OTel SDK shut down'); })
      .catch((error) => { console.error('OTel shutdown error', error); });
  });
}
