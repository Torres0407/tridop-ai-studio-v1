// ─── libs/clients/src/commerce.client.ts ────────────────────────────────────
// STUB — implemented in Phase 6 (commerce-service build)
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseServiceClient } from './baseClient';
import { InjectClient } from './inject-client.decorator';

export const COMMERCE_CLIENT = 'COMMERCE_SERVICE';

@Injectable()
export class CommerceClient extends BaseServiceClient {
  constructor(@InjectClient(COMMERCE_CLIENT) protected readonly proxy: ClientProxy) { super(); }

  createProduct(data: any): Promise<any> {
    return this.send('commerce.products.create', data);
  }

  listProducts(data: { siteId: string }): Promise<any> {
    return this.send('commerce.products.list', data);
  }

  createBooking(data: any): Promise<any> {
    return this.send('commerce.bookings.create', data);
  }

  listOrders(data: { siteId: string }): Promise<any> {
    return this.send('commerce.orders.list', data);
  }

  updateOrderStatus(data: { id: string; status: string }): Promise<any> {
    return this.send('commerce.orders.updateStatus', data);
  }

  syncInventory(data: { productId: string; quantity: number }): Promise<any> {
    return this.send('commerce.inventory.sync', data);
  }

  checkoutPaystack(data: { siteId: string; subaccountCode?: string; amount: number; email: string }): Promise<any> {
    return this.send('commerce.checkout.paystack', data);
  }
}
