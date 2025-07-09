import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ON_BREAK = 'on_break',
  SUSPENDED = 'suspended',
}

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  BICYCLE = 'bicycle',
}

export enum DriverVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  driver_number: string;

  @Column()
  license_number: string;
  @Column()
  order_id: number;
  @Column()
  driver_name: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.MOTORCYCLE,
  })
  vehicle_type: VehicleType;

  @Column({ nullable: true })
  vehicle_registration: string;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.OFFLINE,
  })
  status: DriverStatus;

  @Column({
    type: 'enum',
    enum: DriverVerificationStatus,
    default: DriverVerificationStatus.PENDING,
  })
  verification_status: DriverVerificationStatus;

  //   @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  //   rating: number;

  @Column({ default: 0 })
  total_deliveries: number;

  @Column({ type: 'timestamp', nullable: true })
  last_active_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

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

  // Auto-generate driver number before inserting
  @BeforeInsert()
  generateDriverNumber() {
    if (!this.driver_number) {
      this.driver_number = this.createDriverNumber();
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

    // Set verified_at when verification status becomes verified (if not already set)
    if (
      this.verification_status === DriverVerificationStatus.VERIFIED &&
      !this.verified_at
    ) {
      this.verified_at = now;
    }

    // Set last_active_at when status becomes available or busy
    if (
      this.status === DriverStatus.AVAILABLE ||
      this.status === DriverStatus.BUSY
    ) {
      this.last_active_at = now;
    }
  }

  private createDriverNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `DRV${date}${timestamp}${random}`;
  }
}
