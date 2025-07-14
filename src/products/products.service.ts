import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // create product
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    try {
      // Check if product with same name already exists
      const existingProduct = await this.productRepository.findOne({
        where: { product_name: createProductDto.product_name },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this name already exists');
      }

      const newProduct = this.productRepository.create(createProductDto);
      const savedProduct = await this.productRepository.save(newProduct);

      return {
        success: true,
        message: 'Product created successfully',
        data: savedProduct,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      return {
        success: false,
        message: 'Failed to create product',
        error: error.message,
      };
    }
  }

  async createProductWithImage(
    createProductDto: CreateProductDto,
    imageUrl: string,
  ) {
    const product = this.productRepository.create({
      ...createProductDto,
      imageUrl: imageUrl, // Save Cloudinary URL to imageUrl
    });
    return this.productRepository.save(product);
  }

  // find all products
  async findAll(): Promise<ApiResponse<Product[]>> {
    try {
      const products = await this.productRepository.find({
        order: { created_at: 'DESC' },
      });

      return {
        success: true,
        message: `Found ${products.length} products`,
        data: products,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      };
    }
  }

  // find one product by id
  async findOne(id: number): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Product found successfully',
        data: product,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find product with id ${id}`,
        error: error.message,
      };
    }
  }

  // update product by id
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findOne({
        where: { id },
      });
      if (!existingProduct) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      const productToUpdate = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });

      if (!productToUpdate) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      const updatedProduct = await this.productRepository.save(productToUpdate);

      return {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update product with id ${id}`,
        error: error.message,
      };
    }
  }

  // delete product by id
  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if product exists first
      const existingProduct = await this.productRepository.findOne({
        where: { id },
      });
      if (!existingProduct) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      const result = await this.productRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete product with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Product with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete product with id ${id}`,
        error: error.message,
      };
    }
  }
}
