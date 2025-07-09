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
  Query,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import {
  Driver,
  DriverStatus,
  DriverVerificationStatus,
} from './entities/driver.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards';
import { AtGuard } from 'src/auth/token/token.guard';
import { Public, Roles } from 'src/auth/decorators';
import { Role } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';

// Define ApiResponse interface to match the service
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Controller('drivers')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // create driver
  @Post()
  @Roles(Role.ADMIN, Role.USER) // Admins and users can register as drivers
  create(
    @Body() createDriverDto: CreateDriverDto,
  ): Promise<ApiResponse<Driver>> {
    return this.driversService.create(createDriverDto);
  }

  // get all drivers
  @Get()
  @Roles(Role.ADMIN) // Only admins can view all drivers
  async findAll(): Promise<ApiResponse<Driver[]>> {
    return this.driversService.findAll();
  }

  // get available drivers (for order assignment)
  @Get('available')
  @Roles(Role.ADMIN, Role.USER) // Admins and users can see available drivers
  async getAvailableDrivers(): Promise<ApiResponse<Driver[]>> {
    return this.driversService.getAvailableDrivers();
  }

  // get driver by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.DRIVER, Role.USER) // Admins, drivers, and users can view driver details
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Driver>> {
    return this.driversService.findOne(id);
  }

  // get drivers by user id
  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.USER) // Admins and users can view their driver profiles
  async getDriversByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<Driver[]>> {
    return this.driversService.getDriversByUserId(userId);
  }

  // get drivers by status
  @Get('status/:status')
  @Roles(Role.ADMIN) // Only admins can filter drivers by status
  async getDriversByStatus(
    @Param('status') status: DriverStatus,
  ): Promise<ApiResponse<Driver[]>> {
    return this.driversService.getDriversByStatus(status);
  }

  // get drivers by verification status
  @Get('verification/:verificationStatus')
  @Roles(Role.ADMIN) // Only admins can filter drivers by verification status
  async getDriversByVerificationStatus(
    @Param('verificationStatus') verificationStatus: DriverVerificationStatus,
  ): Promise<ApiResponse<Driver[]>> {
    return this.driversService.getDriversByVerificationStatus(
      verificationStatus,
    );
  }

  // verify driver (admin only)
  @Put(':id/verify')
  @Roles(Role.ADMIN) // Only admins can verify drivers
  async verifyDriver(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Driver>> {
    return this.driversService.verifyDriver(id);
  }

  // update driver by id
  @Put(':id')
  @Roles(Role.ADMIN, Role.DRIVER) // Admins and drivers can update driver profiles
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDriverDto: UpdateDriverDto,
  ): Promise<ApiResponse<Driver>> {
    return this.driversService.update(id, updateDriverDto);
  }

  // delete driver by id
  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete drivers
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.driversService.remove(id);
  }
  // get driver with their orders
  @Get(':id/orders')
  // @Roles(Role.ADMIN, Role.DRIVER) // Admins and drivers can view their orders
  async getDriverOrders(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Order[]>> {
    return this.driversService.getDriversWithOrders(id);
  }
}
