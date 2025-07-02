import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
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
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  // create payment
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    try {
      const newPayment = this.paymentRepository.create(createPaymentDto);
      const savedPayment = await this.paymentRepository.save(newPayment);

      return {
        success: true,
        message: 'Payment created successfully',
        data: savedPayment,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create payment',
        error: error.message,
      };
    }
  }

  // find all payments
  async findAll(): Promise<ApiResponse<Payment[]>> {
    try {
      const payments = await this.paymentRepository.find({
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
        message: `Found ${payments.length} payments`,
        data: payments,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch payments',
        error: error.message,
      };
    }
  }

  // find one payment by id
  async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    try {
      const payment = await this.paymentRepository.findOne({
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

      if (!payment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Payment found successfully',
        data: payment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find payment with id ${id}`,
        error: error.message,
      };
    }
  }

  // update payment by id
  async updatePayment(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    try {
      // Check if payment exists
      const existingPayment = await this.paymentRepository.findOne({ where: { id } });
      if (!existingPayment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }

      const paymentToUpdate = await this.paymentRepository.preload({
        id: id,
        ...updatePaymentDto,
      });

      if (!paymentToUpdate) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }

      const updatedPayment = await this.paymentRepository.save(paymentToUpdate);

      return {
        success: true,
        message: 'Payment updated successfully',
        data: updatedPayment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update payment with id ${id}`,
        error: error.message,
      };
    }
  }

  // delete payment by id
  async deletePayment(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if payment exists first
      const existingPayment = await this.paymentRepository.findOne({ where: { id } });
      if (!existingPayment) {
        throw new NotFoundException(`Payment with id ${id} not found`);
      }

      const result = await this.paymentRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete payment with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Payment with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete payment with id ${id}`,
        error: error.message,
      };
    }
  }

  // find payments by user id
  async getPaymentsByUserId(userId: number): Promise<ApiResponse<Payment[]>> {
    try {
      const payments = await this.paymentRepository.find({
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
        message: `Found ${payments.length} payments for user ${userId}`,
        data: payments,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch payments for user ${userId}`,
        error: error.message,
      };
    }
  }
}
