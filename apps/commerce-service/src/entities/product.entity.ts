import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products', { schema: 'commerce' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  siteId: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
