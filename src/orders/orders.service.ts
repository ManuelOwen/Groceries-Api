import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
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
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // create order
  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<ApiResponse<Order>> {
    try {
      const newOrder = this.orderRepository.create(createOrderDto);
      const savedOrder = await this.orderRepository.save(newOrder);

      return {
        success: true,
        message: 'Order created successfully',
        data: savedOrder,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create order',
        error: error.message,
      };
    }
  }

  // find all orders
  async findAll(): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${orders.length} orders`,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      };
    }
  }

  // find one order by id
  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Order found successfully',
        data: order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find order with id ${id}`,
        error: error.message,
      };
    }
  }

  // update order by id
  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    try {
      // Check if order exists
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
      });
      if (!existingOrder) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      // Handle status-specific updates (entity hooks will also handle this)
      const updateData = { ...updateOrderDto };

      // Manual backup logic for timestamp setting (in case entity hooks don't fire)
      if (
        updateOrderDto.status === OrderStatus.SHIPPED &&
        !existingOrder.shipped_at
      ) {
        updateData.shipped_at = new Date();
      }
      if (updateOrderDto.status === OrderStatus.DELIVERED) {
        if (!existingOrder.delivered_at) {
          updateData.delivered_at = new Date();
        }
        // Ensure shipped_at is also set if delivered
        if (!existingOrder.shipped_at) {
          updateData.shipped_at = new Date();
        }
      }

      const orderToUpdate = await this.orderRepository.preload({
        id: id,
        ...updateData,
      });

      if (!orderToUpdate) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      const updatedOrder = await this.orderRepository.save(orderToUpdate);

      return {
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update order with id ${id}`,
        error: error.message,
      };
    }
  }
  //  find order by category
  // delete order by id
  async deleteOrder(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if order exists first
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
      });
      if (!existingOrder) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      const result = await this.orderRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete order with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Order with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete order with id ${id}`,
        error: error.message,
      };
    }
  }

  // find orders by user id
  async getOrdersByUserId(userId: number): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        where: { user_id: userId },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${orders.length} orders for user ${userId}`,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch orders for user ${userId}`,
        error: error.message,
      };
    }
  }

  // find orders by status
  async getOrdersByStatus(status: OrderStatus): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        where: { status },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${orders.length} orders with status ${status}`,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch orders with status ${status}`,
        error: error.message,
      };
    }
  }
  // get order by priority
  async getOrdersByPriority(
    priority: Order['priority'],
  ): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        where: { priority },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${orders.length} orders with priority ${priority}`,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch orders with priority ${priority}`,
        error: error.message,
      };
    }
  }
  // get orders allocated to driver
}
