import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products/products.service';
import { BookingsService } from './bookings/bookings.service';
import { IdempotencyService } from '@libs/common';
import { OrderEntity } from './entities/order.entity';
import { InventoryEntity } from './entities/inventory.entity';

import { ConfigService } from '@nestjs/config';

@Controller()
export class CommerceController {
  constructor(
    private readonly config: ConfigService,
    private readonly productsService: ProductsService,
    private readonly bookingsService: BookingsService,
    private readonly idempotency: IdempotencyService,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
  ) {}

  // --- Products ---
  @MessagePattern('products.create')
  async createProduct(@Payload() data: any) {
    if (data.idempotencyKey) await this.idempotency.checkAndLock('commerce_prod', data.idempotencyKey);
    const result = await this.productsService.create(data);
    if (data.idempotencyKey) await this.idempotency.complete('commerce_prod', data.idempotencyKey, 'success');
    return result;
  }

  @MessagePattern('products.update')
  async updateProduct(@Payload() data: { id: string; product: any }) {
    return this.productsService.update(data.id, data.product);
  }

  @MessagePattern('products.delete')
  async deleteProduct(@Payload() data: { id: string }) {
    await this.productsService.delete(data.id);
    return { status: 'deleted', id: data.id };
  }

  @MessagePattern('products.list')
  async listProducts(@Payload() data: { siteId: string }) {
    return this.productsService.findAll(data.siteId);
  }

  // --- Bookings ---
  @MessagePattern('bookings.create')
  async createBooking(@Payload() data: any) {
    if (data.idempotencyKey) await this.idempotency.checkAndLock('commerce_book', data.idempotencyKey);
    const result = await this.bookingsService.create(data);
    if (data.idempotencyKey) await this.idempotency.complete('commerce_book', data.idempotencyKey, 'success');
    return result;
  }

  @MessagePattern('bookings.update')
  async updateBooking(@Payload() data: { id: string; booking: any }) {
    return this.bookingsService.update(data.id, data.booking);
  }

  @MessagePattern('bookings.cancel')
  async cancelBooking(@Payload() data: { id: string }) {
    await this.bookingsService.cancel(data.id);
    return { status: 'cancelled', id: data.id };
  }

  @MessagePattern('bookings.list')
  async listBookings(@Payload() data: { siteId: string }) {
    return this.bookingsService.findAll(data.siteId);
  }

  // --- Orders ---
  @MessagePattern('commerce.orders.list')
  async listOrders(@Payload() data: { siteId: string }) {
    return this.orderRepo.find({ where: { siteId: data.siteId }, order: { createdAt: 'DESC' } });
  }

  @MessagePattern('commerce.orders.updateStatus')
  async updateOrderStatus(@Payload() data: { id: string; status: string }) {
    await this.orderRepo.update({ id: data.id }, { status: data.status });
    return this.orderRepo.findOne({ where: { id: data.id } });
  }

  // --- Inventory ---
  @MessagePattern('commerce.inventory.sync')
  async syncInventory(@Payload() data: { productId: string; quantity: number }) {
    let inventory = await this.inventoryRepo.findOne({ where: { productId: data.productId } });
    if (inventory) {
      inventory.quantity = data.quantity;
    } else {
      inventory = this.inventoryRepo.create({ productId: data.productId, quantity: data.quantity });
    }
    return this.inventoryRepo.save(inventory);
  }

  // --- Checkout ---
  @MessagePattern('commerce.checkout.paystack')
  async checkoutPaystack(@Payload() data: { siteId: string; subaccountCode?: string; amount: number; email: string; items?: any[] }) {
    const secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not configured');

    const payload: any = {
      email: data.email,
      amount: data.amount * 100, // Paystack expects amount in kobo/cents
      metadata: {
        siteId: data.siteId,
      }
    };

    if (data.subaccountCode) {
      payload.subaccount = data.subaccountCode;
      payload.bearer = 'subaccount'; // Business Owner pays the transaction fees
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result: any = await response.json();
    if (!result.status) {
      throw new Error(`Paystack checkout failed: ${result.message}`);
    }

    // Create a pending order entity so we can track this transaction
    const order = this.orderRepo.create({
      id: result.data.reference, // Use Paystack's reference as our Order ID for easy webhook mapping
      siteId: data.siteId,
      customerId: data.email,
      totalPrice: data.amount,
      currency: 'USD',
      status: 'pending',
    });
    await this.orderRepo.save(order);

    console.log(`[Commerce] Generated Paystack checkout URL for ${data.amount} (Split: ${data.subaccountCode || 'No'})`);
    return { url: result.data.authorization_url, reference: result.data.reference };
  }
}
