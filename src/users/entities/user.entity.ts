import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  DRIVER = 'driver',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 500 })
  address: string;

  @Column({ length: 255 })
  password: string;

  // @CreateDateColumn({ type: 'timestamp' })
  // created_at: Date;

  // @UpdateDateColumn({ type: 'timestamp' })
  // updated_at: Date;

  @Column({ unique: true, length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  hashedRefreshToken?: string | null;

  // @DeleteDateColumn({ type: 'timestamp',})
  // deletedAt?: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  // @Column({ type: 'varchar', nullable: true, length: 100 })
  // passwordResetToken?: string | null;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings() {
    if (this.fullName) {
      this.fullName = this.fullName.trim();
    }
    if (this.address) {
      this.address = this.address.trim();
    }
    if (this.phoneNumber) {
      this.phoneNumber = this.phoneNumber.trim();
    }
  }

  // Methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // toJSON() {
  //   const { password, hashedRefreshToken, ...result } = this;
  //   return result;
  // }
}
