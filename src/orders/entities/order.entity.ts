import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderPriority,
    default: OrderPriority.NORMAL,
  })
  priority: OrderPriority;

  @Column({ nullable: true })
  shipping_address: string;

  @Column({ nullable: true })
  billing_address: string;


  @Column({ type: 'timestamp', nullable: true })
  shipped_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

 

  

  // Relations
  @Column()
  user_id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Auto-generate order number before inserting
  @BeforeInsert()
  generateOrderNumber() {
    if (!this.order_number) {
      this.order_number = this.createOrderNumber();
    }
    this.setStatusTimestamps();
  }

  // Handle status changes before updates
  @BeforeUpdate()
  handleStatusUpdate() {
    this.setStatusTimestamps();
  }

  // Set timestamps based on status
  private setStatusTimestamps() {
    const now = new Date();
    
    // Set shipped_at when status becomes shipped (if not already set)
    if (this.status === OrderStatus.SHIPPED && !this.shipped_at) {
      this.shipped_at = now;
    }
    
    // Set delivered_at when status becomes delivered (if not already set)
    if (this.status === OrderStatus.DELIVERED && !this.delivered_at) {
      this.delivered_at = now;
      // Also set shipped_at if it's not set (delivered implies shipped)
      if (!this.shipped_at) {
        this.shipped_at = now;
      }
    }
  }

  private createOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${date}${timestamp}${random}`;
  }
}
