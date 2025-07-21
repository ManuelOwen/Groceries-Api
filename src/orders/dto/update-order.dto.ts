import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  shipped_at?: Date;

  @IsOptional()
  delivered_at?: Date;

  @IsOptional()
  items?: any[];
}
