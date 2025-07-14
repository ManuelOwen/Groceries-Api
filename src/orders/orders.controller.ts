import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
  // Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
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

@Controller('orders')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // create order
  @Post()
  @Roles(Role.ADMIN, Role.USER) // Admins and users can create orders
  create(@Body() createOrderDto: CreateOrderDto): Promise<ApiResponse<Order>> {
    return this.ordersService.createOrder(createOrderDto);
  }

  // get all orders
  @Public()
  @Get()
  // @Roles(Role.ADMIN, Role.DRIVER) // Admins and drivers can view all orders
  async findAll(): Promise<ApiResponse<Order[]>> {
    return this.ordersService.findAll();
  }

  // get order by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER, Role.DRIVER) // Admins, users, and drivers can view orders
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Order>> {
    return this.ordersService.getOrderById(id);
  }

  // get orders by user id
  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.USER) // Admins and users can view user orders
  async getOrdersByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<Order[]>> {
    return this.ordersService.getOrdersByUserId(userId);
  }

  // get orders by status
  @Get('status/:status')
  @Roles(Role.ADMIN, Role.DRIVER) // Admins and drivers can filter by status
  async getOrdersByStatus(
    @Param('status') status: OrderStatus,
  ): Promise<ApiResponse<Order[]>> {
    return this.ordersService.getOrdersByStatus(status);
  }

  // update order by id
  @Put(':id')
  @Roles(Role.ADMIN, Role.DRIVER) // Admins and drivers can update orders
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    console.log('[UpdateOrder] Received update data:', JSON.stringify(updateOrderDto, null, 2));
    console.log('[UpdateOrder] Order ID:', id);
    console.log('[UpdateOrder] Data types:', {
      total_amount: typeof updateOrderDto.total_amount,
      user_id: typeof updateOrderDto.user_id,
      status: typeof updateOrderDto.status,
      priority: typeof updateOrderDto.priority,
    });
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  // delete order by id
  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete orders
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.ordersService.deleteOrder(id);
  }
}
