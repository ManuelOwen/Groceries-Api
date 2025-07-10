import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsString()
  @IsOptional()
  category?: ProductCategory;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
