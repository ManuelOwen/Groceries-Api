
import { Type } from 'class-transformer';
import { OrderStatus, OrderPriority } from '../entities/order.entity';

import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';
export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total_amount: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  user_id: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(OrderPriority)
  @IsOptional()
  priority?: OrderPriority;

  @IsString()
  @IsOptional()
  order_number?: string;

  @IsString()
  @IsOptional()
  shipping_address?: string;

  // @IsString()
  // @IsOptional()
  // billing_address?: string;
}
