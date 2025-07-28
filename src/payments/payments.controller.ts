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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards';
import { AtGuard } from 'src/auth/token/token.guard';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/users/entities/user.entity';

// Define ApiResponse interface to match the service
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Controller('payments')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // create payment
  @Post()
  @Roles(Role.ADMIN, Role.USER) // Admins and users can create payments
  create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  // get all payments
  @Get()
  @Roles(Role.ADMIN) // Only admins can view all payments
  async findAll(): Promise<ApiResponse<Payment[]>> {
    return this.paymentsService.findAll();
  }

  // get payment by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER) // Admins and users can view payments
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Payment>> {
    return this.paymentsService.getPaymentById(id);
  }

  // get payments by user id
  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.USER) // Admins and users can view user payments
  async getPaymentsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApiResponse<Payment[]>> {
    return this.paymentsService.getPaymentsByUserId(userId);
  }

  // update payment by id
  @Put(':id')
  @Roles(Role.ADMIN) // Only admins can update payments
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    return this.paymentsService.updatePayment(id, updatePaymentDto);
  }

  // delete payment by id
  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete payments
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.paymentsService.deletePayment(id);
  }
}
