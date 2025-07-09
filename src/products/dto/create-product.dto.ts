import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @IsNumber()
  @Min(0.01)
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
