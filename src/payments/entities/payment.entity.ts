import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  MPESA = 'mpesa',
  CARD = 'card',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.MPESA,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ nullable: true })
  reference_number: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // Relations
  @Column()
  user_id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Auto-generate transaction ID before inserting
  @BeforeInsert()
  generateTransactionId() {
    if (!this.transaction_id) {
      this.transaction_id = this.createTransactionId();
    }
    if (!this.reference_number) {
      this.reference_number = this.createReferenceNumber();
    }
  }

  private createTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    switch (this.payment_method) {
      case PaymentMethod.MPESA:
        return `MP${timestamp.slice(-8)}${random}`;
      case PaymentMethod.CARD:
        return `CD${timestamp.slice(-8)}${random}`;
      case PaymentMethod.CASH:
        return `CH${timestamp.slice(-8)}${random}`;
      case PaymentMethod.BANK_TRANSFER:
        return `BT${timestamp.slice(-8)}${random}`;
      default:
        return `TX${timestamp.slice(-8)}${random}`;
    }
  }

  private createReferenceNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    return `REF${date}${random}`;
  }
}
