// ─── api-gateway/src/proxy/billing.proxy.ts ──────────────────────────────────
// STUB — HTTP controllers for billing-service will be implemented in the
// corresponding build phase. Until then these are registered but return 503.
import { Controller, All, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Billing')
@Controller('billing')
export class BillingProxy {
  @All('*')
  notReady() {
    throw new ServiceUnavailableException('billing-service not yet deployed');
  }
}
