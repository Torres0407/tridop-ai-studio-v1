import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { User } from '@libs/types';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.findById')
  findById(@Payload() { id }: { id: string }): Promise<User> {
    return this.usersService.findById(id);
  }

  @MessagePattern('users.count')
  countAll(): Promise<number> {
    return this.usersService.countAll();
  }

  @MessagePattern('users.list')
  listAll(@Payload() { limit, offset }: { limit?: number; offset?: number }): Promise<User[]> {
    return this.usersService.listAll(limit, offset);
  }

  @MessagePattern('users.update')
  update(@Payload() { id, ...dto }: { id: string } & UpdateUserDto): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @MessagePattern('users.delete')
  delete(@Payload() { id }: { id: string }): Promise<void> {
    return this.usersService.delete(id);
  }

  @MessagePattern('users.suspend')
  suspend(@Payload() { id }: { id: string }): Promise<void> {
    return this.usersService.suspend(id);
  }

  @MessagePattern('users.unsuspend')
  unsuspend(@Payload() { id }: { id: string }): Promise<void> {
    return this.usersService.unsuspend(id);
  }

  @MessagePattern('users.impersonate')
  impersonate(@Payload() { id }: { id: string }): Promise<{ accessToken: string }> {
    return this.usersService.impersonate(id);
  }
}
