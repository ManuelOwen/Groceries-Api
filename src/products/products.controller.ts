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
  UploadedFile,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCloudinaryStorage } from '../config/multer-cloudinary.config';

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
  @UseInterceptors(
    FileInterceptor('image', { storage: multerCloudinaryStorage }),
  )
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = file?.path;
    return this.productsService.createProductWithImage(
      createProductDto,
      imageUrl,
    );
  }

  // Get all products -
  @Get()
  @Public() // Allow both admins and users to access
  findAll(): Promise<ApiResponse<Product[]>> {
    return this.productsService.findAll();
  }

  // Get product by id - public access
  @Get(':id')
  @Public()
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Product>> {
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
  // Upload product image - only admins can upload images

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerCloudinaryStorage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    const imageUrl = `/uploads/products/${file.filename}`;
    return {
      success: true,
      message: 'File uploaded successfully',
      imageUrl,
    };
  }
}
