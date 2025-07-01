import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards';
import { AtGuard } from 'src/auth/token/token.guard';
import { Public, Roles } from 'src/auth/decorators';
import { Role } from 'src/users/entities/user.entity';

// Define ApiResponse interface to match the service
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Controller('products')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Create product - only admins can create products
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto): Promise<ApiResponse<Product>> {
    return this.productsService.create(createProductDto);
  }

  // Get all products -
  @Get()
 @Public () // Allow both admins and users to access
  findAll(): Promise<ApiResponse<Product[]>> {
    return this.productsService.findAll();
  }

  // Get product by id - public access
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Product>> {
    return this.productsService.findOne(id);
  }

  // Update product - only admins can update products
  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    return this.productsService.update(id, updateProductDto);
  }

  // Delete product - only admins can delete products
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<null>> {
    return this.productsService.remove(id);
  }
}
