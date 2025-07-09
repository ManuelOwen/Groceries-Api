import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_CUSTOMER = 'pending_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportTicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  ORDER_ISSUE = 'order_issue',
  PRODUCT_INQUIRY = 'product_inquiry',
  GENERAL = 'general',
  COMPLAINT = 'complaint',
}

@Entity('customers_support')
export class CustomersSupport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ticket_number: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  status: SupportTicketStatus;

  @Column({
    type: 'enum',
    enum: SupportTicketPriority,
    default: SupportTicketPriority.MEDIUM,
  })
  priority: SupportTicketPriority;

  @Column({
    type: 'enum',
    enum: SupportTicketCategory,
    default: SupportTicketCategory.GENERAL,
  })
  category: SupportTicketCategory;

  @Column({ type: 'text', nullable: true })
  admin_response: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

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

  @Column({ nullable: true })
  assigned_to: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'assigned_to' })
  assignedAdmin: User;

  @BeforeInsert()
  generateTicketNumber() {
    // Generate a ticket number format: CS-YYYYMMDD-XXXX (e.g., CS-20250702-0001)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');

    this.ticket_number = `CS-${year}${month}${day}-${randomNum}`;
  }
}
