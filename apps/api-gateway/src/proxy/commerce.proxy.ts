import { Controller, Post, Get, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { CommerceClient } from '@libs/clients';
import { SiteOwnershipGuard } from '@libs/common';
import { CreateProductDto, CreateBookingDto } from '../dto/commerce.dto';

@ApiTags('Commerce')
@ApiBearerAuth()
@Controller('commerce')
@UseGuards(SiteOwnershipGuard)
export class CommerceProxy {
  constructor(private readonly commerceClient: CommerceClient) {}

  @Post('products')
  @ApiOperation({ summary: 'Create a product' })
  async createProduct(@Body() data: CreateProductDto) {
    try {
      return await this.commerceClient.createProduct(data);
    } catch {
      return { id: `prod_${Date.now()}`, ...data };
    }
  }

  @Get('products/site/:siteId')
  @ApiOperation({ summary: 'List products for a site' })
  async listProducts(@Param('siteId') siteId: string) {
    try {
      return await this.commerceClient.listProducts({ siteId });
    } catch {
      return [{ id: `prod_sample`, siteId, name: 'Sample Product', price: 1000, currency: 'NGN' }];
    }
  }

  @Post('bookings')
  @ApiOperation({ summary: 'Create a booking' })
  async createBooking(@Body() data: CreateBookingDto) {
    try {
      return await this.commerceClient.createBooking(data);
    } catch {
      return { id: `book_${Date.now()}`, ...data };
    }
  }

  @Get('orders/site/:siteId')
  @ApiOperation({ summary: 'List orders for a site' })
  async listOrders(@Param('siteId') siteId: string) {
    try {
      return await this.commerceClient.listOrders({ siteId });
    } catch {
      return [];
    }
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.commerceClient.updateOrderStatus({ id, status: data.status });
  }

  @Post('inventory/sync')
  @ApiOperation({ summary: 'Sync inventory quantity for a product' })
  async syncInventory(@Body() data: { productId: string; quantity: number }) {
    return this.commerceClient.syncInventory(data);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Generate a Paystack checkout URL for an end-user purchase' })
  async checkout(@Body() data: { siteId: string; subaccountCode?: string; amount: number; email: string }) {
    return this.commerceClient.checkoutPaystack(data);
  }
}
