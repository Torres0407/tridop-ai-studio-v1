// ─── libs/clients/src/owner.client.ts ───────────────────────────────────────
// STUB — implemented in Phase 8 (owner-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const OWNER_CLIENT = 'OWNER_SERVICE';

@Injectable()
export class OwnerClient extends BaseServiceClient {
  constructor(@InjectClient(OWNER_CLIENT) protected readonly proxy: ClientProxy) { super(); }
}
