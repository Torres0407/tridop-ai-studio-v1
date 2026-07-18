// ─── libs/clients/src/deploy.client.ts ──────────────────────────────────────
// STUB — implemented in Phase 5 (deploy-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const DEPLOY_CLIENT = 'DEPLOY_SERVICE';

@Injectable()
export class DeployClient extends BaseServiceClient {
  constructor(@InjectClient(DEPLOY_CLIENT) protected readonly proxy: ClientProxy) { super(); }
  triggerDeploy(payload: Record<string, unknown>): Promise<never> {
    return this.send('deploy.trigger', payload, { timeoutMs: 10_000 });
  }
  getStatus(jobId: string): Promise<never> {
    return this.send('deploy.status', { jobId });
  }
  recordUsage(payload: Record<string, unknown>): Promise<never> {
    return this.send('billing.usage.record', payload);
  }
}
