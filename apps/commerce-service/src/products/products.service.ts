import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async findAll(siteId: string): Promise<ProductEntity[]> {
    return this.repo.find({ where: { siteId } });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async deleteProductsBySite(siteId: string): Promise<void> {
    await this.repo.delete({ siteId });
  }
}
