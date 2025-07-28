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
  Request,
  ForbiddenException,
  // Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards';
import { AtGuard } from '../auth/token/token.guard';
import { Public, Roles } from '../auth/decorators';
import { Role } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

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
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

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
  @Roles(Role.ADMIN, Role.USER, Role.DRIVER) // Allow drivers to access orders too
  async getOrdersByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ): Promise<ApiResponse<Order[]>> {
    const currentUser = req.user;
    console.log('🔍 getOrdersByUser - Current user:', currentUser);
    console.log('🔍 getOrdersByUser - Requested user ID:', userId);
    console.log('🔍 getOrdersByUser - User role:', currentUser?.role);

    // If user is not admin and not requesting their own orders, deny access
    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      console.log(
        "❌ getOrdersByUser - Permission denied: User trying to access another user's orders",
      );
      throw new ForbiddenException('You can only access your own orders');
    }

    console.log('✅ getOrdersByUser - Permission granted');
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
  @Roles(Role.ADMIN, Role.USER, Role.DRIVER) // Admins, users, and drivers can update orders
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    console.log(
      '[UpdateOrder] Received update data:',
      JSON.stringify(updateOrderDto, null, 2),
    );
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
  //  get orders by userid and role
  @Get('user/:userId/role/:role')
  @Roles(Role.ADMIN, Role.DRIVER) // Only admins can view orders by user and role
  async getOrdersByUserAndRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('role') role: Role,
  ): Promise<ApiResponse<Order[]>> {
    return this.ordersService.getOrdersByUserIdAndRole(userId, role);
  }

  @Patch(':id/assign-driver')
  @Roles(Role.ADMIN)
  async assignDriver(
    @Param('id') id: number,
    @Body('driver_id') driver_id: number,
  ): Promise<any> {
    // Check if the user is a driver
    const driverResponse = await this.usersService.getUserById(driver_id);
    const driver = driverResponse.data;
    if (!driver || driver.role !== 'driver') {
      return { success: false, message: 'User is not a driver' };
    }
    return this.ordersService.assignDriverToOrder(id, driver_id);
  }
}
