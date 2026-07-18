import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('order_items', { schema: 'commerce' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal')
  unitPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
