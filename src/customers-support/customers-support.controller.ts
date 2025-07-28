import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomersSupportService } from './customers-support.service';
import { CreateCustomersSupportDto } from './dto/create-customers-support.dto';
import { UpdateCustomersSupportDto } from './dto/update-customers-support.dto';
import { CustomersSupport } from './entities/customers-support.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards';
import { AtGuard } from 'src/auth/token/token.guard';
import { Roles } from 'src/auth/decorators';
import { Role } from '../users/entities/user.entity';

// Define ApiResponse interface to match the service
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Controller('customers-support')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class CustomersSupportController {
  constructor(
    private readonly customersSupportService: CustomersSupportService,
  ) {}

  // create support ticket
  @Post()
  @Roles(Role.USER, Role.ADMIN) // Users and admins can create support tickets
  create(
    @Body() createCustomersSupportDto: CreateCustomersSupportDto,
  ): Promise<ApiResponse<CustomersSupport>> {
    return this.customersSupportService.createSupportTicket(
      createCustomersSupportDto,
    );
  }

  // get all support tickets (admin only)
  @Get()
  @Roles(Role.ADMIN)
  async findAllSupportTickets(): Promise<ApiResponse<CustomersSupport[]>> {
    return this.customersSupportService.findAll();
  }

  // get support ticket by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER) // Admin can see all, users can see their own
  async getSupportTicketById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<CustomersSupport>> {
    return this.customersSupportService.getSupportTicketById(id);
  }

  // get support tickets by user id
  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.USER) // Admin can see all, users can see their own
  async getSupportTicketsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<CustomersSupport[]>> {
    return this.customersSupportService.getSupportTicketsByUserId(userId);
  }

  // get support tickets by status (admin only)
  @Get('status/:status')
  @Roles(Role.ADMIN)
  async getSupportTicketsByStatus(
    @Param('status') status: string,
  ): Promise<ApiResponse<CustomersSupport[]>> {
    return this.customersSupportService.getSupportTicketsByStatus(status);
  }

  // update support ticket by id
  @Put(':id')
  @Roles(Role.ADMIN, Role.USER) // Admin can update any, users can update their own
  async updateSupportTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomersSupportDto: UpdateCustomersSupportDto,
  ): Promise<ApiResponse<CustomersSupport>> {
    return this.customersSupportService.updateSupportTicket(
      id,
      updateCustomersSupportDto,
    );
  }

  // delete support ticket by id (admin only)
  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteSupportTicket(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.customersSupportService.deleteSupportTicket(id);
  }
}
