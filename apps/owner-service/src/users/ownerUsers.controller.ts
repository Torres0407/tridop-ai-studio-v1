import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

/**
 * Handles owner-level user management by delegating to identity-service.
 * owner-service has no direct DB access to the users table.
 */
@Controller()
export class OwnerUsersController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @MessagePattern('owner.users.list')
  async listUsers(@Payload() data: { page?: number; limit?: number }) {
    return firstValueFrom(this.identityClient.send('users.list', data));
  }

  @MessagePattern('owner.users.suspend')
  async suspendUser(@Payload() data: { userId: string }) {
    return firstValueFrom(this.identityClient.send('users.suspend', data));
  }

  @MessagePattern('owner.users.unsuspend')
  async unsuspendUser(@Payload() data: { userId: string }) {
    return firstValueFrom(this.identityClient.send('users.unsuspend', data));
  }

  @MessagePattern('owner.users.impersonate')
  async impersonateUser(@Payload() data: { userId: string }) {
    return firstValueFrom(this.identityClient.send('users.impersonate', data));
  }
}
