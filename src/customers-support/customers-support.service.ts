import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCustomersSupportDto } from './dto/create-customers-support.dto';
import { UpdateCustomersSupportDto } from './dto/update-customers-support.dto';
import { CustomersSupport, SupportTicketStatus } from './entities/customers-support.entity';
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
export class CustomersSupportService {
  constructor(
    @InjectRepository(CustomersSupport)
    private readonly customersSupportRepository: Repository<CustomersSupport>,
  ) {}

  // create support ticket
  async createSupportTicket(createCustomersSupportDto: CreateCustomersSupportDto): Promise<ApiResponse<CustomersSupport>> {
    try {
      const ticketData = { 
        ...createCustomersSupportDto,
        ticket_number: createCustomersSupportDto.ticket_number || this.generateTicketNumber()
      };
      
      const newTicket = this.customersSupportRepository.create(ticketData);
      const savedTicket = await this.customersSupportRepository.save(newTicket);

      return {
        success: true,
        message: 'Support ticket created successfully',
        data: savedTicket,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create support ticket',
        error: error.message,
      };
    }
  }

  // find all support tickets
  async findAll(): Promise<ApiResponse<CustomersSupport[]>> {
    try {
      const tickets = await this.customersSupportRepository.find({
        relations: ['user', 'assignedAdmin'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
          assignedAdmin: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${tickets.length} support tickets`,
        data: tickets,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch support tickets',
        error: error.message,
      };
    }
  }

  // find one support ticket by id
  async getSupportTicketById(id: number): Promise<ApiResponse<CustomersSupport>> {
    try {
      const ticket = await this.customersSupportRepository.findOne({
        where: { id },
        relations: ['user', 'assignedAdmin'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
          assignedAdmin: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Support ticket found successfully',
        data: ticket,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find support ticket with id ${id}`,
        error: error.message,
      };
    }
  }

  // find support tickets by user id
  async getSupportTicketsByUserId(userId: number): Promise<ApiResponse<CustomersSupport[]>> {
    try {
      const tickets = await this.customersSupportRepository.find({
        where: { user_id: userId },
        relations: ['user', 'assignedAdmin'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
          assignedAdmin: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${tickets.length} support tickets for user ${userId}`,
        data: tickets,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch support tickets for user ${userId}`,
        error: error.message,
      };
    }
  }

  // find support tickets by status
  async getSupportTicketsByStatus(status: string): Promise<ApiResponse<CustomersSupport[]>> {
    try {
      const tickets = await this.customersSupportRepository.find({
        where: { status: status as any },
        relations: ['user', 'assignedAdmin'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
          },
          assignedAdmin: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${tickets.length} support tickets with status ${status}`,
        data: tickets,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch support tickets with status ${status}`,
        error: error.message,
      };
    }
  }

  // update support ticket by id
  async updateSupportTicket(
    id: number,
    updateCustomersSupportDto: UpdateCustomersSupportDto,
  ): Promise<ApiResponse<CustomersSupport>> {
    try {
      // Check if ticket exists
      const existingTicket = await this.customersSupportRepository.findOne({ where: { id } });
      if (!existingTicket) {
        throw new NotFoundException(`Support ticket with id ${id} not found`);
      }

      // Handle status-specific updates
      const updateData: any = { ...updateCustomersSupportDto };
      
      // Set resolved_at when status becomes resolved
      if (updateCustomersSupportDto.status === SupportTicketStatus.RESOLVED && !existingTicket.resolved_at) {
        updateData.resolved_at = new Date();
      }

      const ticketToUpdate = await this.customersSupportRepository.preload({
        id: id,
        ...updateData,
      });

      if (!ticketToUpdate) {
        throw new NotFoundException(`Support ticket with id ${id} not found`);
      }

      const updatedTicket = await this.customersSupportRepository.save(ticketToUpdate);

      return {
        success: true,
        message: 'Support ticket updated successfully',
        data: updatedTicket,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update support ticket with id ${id}`,
        error: error.message,
      };
    }
  }

  // delete support ticket by id
  async deleteSupportTicket(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if ticket exists first
      const existingTicket = await this.customersSupportRepository.findOne({ where: { id } });
      if (!existingTicket) {
        throw new NotFoundException(`Support ticket with id ${id} not found`);
      }

      const result = await this.customersSupportRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete support ticket with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Support ticket with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete support ticket with id ${id}`,
        error: error.message,
      };
    }
  }

  // generate unique ticket number
  private generateTicketNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT${date}${timestamp}${random}`;
  }
}
