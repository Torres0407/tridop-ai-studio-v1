import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from './dto/user.dto';
import { User } from '@libs/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.toType(user);
  }

  async countAll(): Promise<number> {
    return this.users.count();
  }

  async listAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const users = await this.users.find({ 
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });
    return users.map(user => this.toType(user));
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    Object.assign(user, dto);
    await this.users.save(user);
    return this.toType(user);
  }

  async delete(id: string): Promise<void> {
    await this.users.delete({ id });
  }

  async suspend(id: string): Promise<void> {
    await this.users.update({ id }, { isSuspended: true });
    // Write to Redis to immediately kill active sessions
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    await redis.setex(`user:suspended:${id}`, 3600, 'true');
    await redis.quit();
  }

  async unsuspend(id: string): Promise<void> {
    await this.users.update({ id }, { isSuspended: false });
    // Remove from Redis
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    await redis.del(`user:suspended:${id}`);
    await redis.quit();
  }

  async impersonate(id: string): Promise<{ accessToken: string }> {
    // Returns a short-lived impersonation token — NOT a full refresh pair
    const user = await this.findById(id);
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, impersonated: true },
      process.env.JWT_ACCESS_SECRET!,
      { algorithm: 'HS256', expiresIn: '1h' },
    );
    return { accessToken: token };
  }

  private toType(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      role: entity.role as 'user' | 'owner',
      oauthProvider: entity.oauthProvider as 'google' | 'github' | 'local',
      oauthId: entity.oauthId ?? undefined,
      isSuspended: entity.isSuspended,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
