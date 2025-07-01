import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  DRIVER = 'driver',
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  address: string;

  @Column()
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column()
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
}
// Relations
