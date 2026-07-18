import type { FindOptionsWhere, ObjectLiteral, FindManyOptions, FindOneOptions } from 'typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

/**
 * TenantRepository acts as a wrapper around the standard TypeORM Repository.
 * It enforces that every query MUST contain a tenant identifier (like siteId or userId)
 * to prevent cross-tenant data leaks.
 */
export class TenantRepository<T extends ObjectLiteral> extends Repository<T> {
  private readonly tenantField: keyof T;

  constructor(repository: Repository<T>, tenantField: keyof T = 'siteId') {
    super(repository.target, repository.manager, repository.queryRunner);
    this.tenantField = tenantField;
  }

  private enforceTenant(options?: any, tenantId?: string) {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required for all database operations to ensure data isolation.');
    }
    const where = options?.where || {};
    return {
      ...options,
      where: {
        ...where,
        [this.tenantField]: tenantId,
      },
    };
  }

  async findByTenant(tenantId: string, options?: FindManyOptions<T>): Promise<T[]> {
    return this.find(this.enforceTenant(options, tenantId));
  }

  async findOneByTenant(tenantId: string, options?: FindOneOptions<T>): Promise<T | null> {
    return this.findOne(this.enforceTenant(options, tenantId));
  }

  async updateByTenant(tenantId: string, criteria: FindOptionsWhere<T>, partialEntity: any) {
    const safeCriteria = this.enforceTenant({ where: criteria }, tenantId).where;
    return this.update(safeCriteria, partialEntity);
  }

  async deleteByTenant(tenantId: string, criteria: FindOptionsWhere<T>) {
    const safeCriteria = this.enforceTenant({ where: criteria }, tenantId).where;
    return this.delete(safeCriteria);
  }
}
