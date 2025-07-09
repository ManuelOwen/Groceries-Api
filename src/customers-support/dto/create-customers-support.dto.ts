import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
  IsEmail,
  Matches,
} from 'class-validator';
import {
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
} from '../entities/customers-support.entity';

export class CreateCustomersSupportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Subject must not exceed 255 characters' })
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description: string;

  @IsEnum(SupportTicketPriority)
  @IsOptional()
  priority?: SupportTicketPriority;

  @IsEnum(SupportTicketCategory)
  @IsOptional()
  category?: SupportTicketCategory;

  @IsEnum(SupportTicketStatus)
  @IsOptional()
  status?: SupportTicketStatus;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  user_id: number;

  @IsString()
  @IsOptional()
  ticket_number?: string;

  @IsEmail()
  @IsOptional()
  contact_email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, {
    message: 'Please provide a valid phone number',
  })
  contact_phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, {
    message: 'Admin response must not exceed 2000 characters',
  })
  admin_response?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  assigned_to?: number;
}
