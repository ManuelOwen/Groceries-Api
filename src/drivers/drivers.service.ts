import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import {
  Driver,
  DriverStatus,
  DriverVerificationStatus,
} from './entities/driver.entity';
import { Order } from '../orders/entities/order.entity';
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
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  // Update the constructor
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // create driver
  async create(createDriverDto: CreateDriverDto): Promise<ApiResponse<Driver>> {
    try {
      const newDriver = this.driverRepository.create(createDriverDto);
      const savedDriver = await this.driverRepository.save(newDriver);

      return {
        success: true,
        message: 'Driver created successfully',
        data: savedDriver,
      };
    } catch (error) {
      this.logger.error('Failed to create driver', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        driverData: createDriverDto,
      });
      throw new InternalServerErrorException({
        message: 'Failed to create driver',
        suggestion: 'Please try again later or contact support',
      });
    }
  }

  // find all drivers
  async findAll(): Promise<ApiResponse<Driver[]>> {
    try {
      const drivers = await this.driverRepository.find({
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${drivers.length} drivers`,
        data: drivers,
      };
    } catch (error) {
      this.logger.error('Failed to fetch drivers', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      throw new InternalServerErrorException({
        message: 'Failed to fetch drivers',
        suggestion: 'Please try again later or contact support',
      });
    }
  }

  // find one driver by id
  async findOne(id: number): Promise<ApiResponse<Driver>> {
    try {
      const driver = await this.driverRepository.findOne({
        where: { id },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      });

      if (!driver) {
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Driver found successfully',
        data: driver,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch driver with ID: ${id}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        driverId: id,
      });
      throw new InternalServerErrorException({
        message: 'Failed to fetch driver',
        suggestion: 'Please try again later or contact support',
      });
    }
  }

  // update driver by id
  async update(
    id: number,
    updateDriverDto: UpdateDriverDto,
  ): Promise<ApiResponse<Driver>> {
    try {
      // Check if driver exists
      const existingDriver = await this.driverRepository.findOne({
        where: { id },
      });
      if (!existingDriver) {
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      // Handle status-specific updates (entity hooks will also handle this)
      const updateData = { ...updateDriverDto };

      // Manual backup logic for timestamp setting (in case entity hooks don't fire)
      if (
        updateDriverDto.verification_status ===
          DriverVerificationStatus.VERIFIED &&
        !existingDriver.verified_at
      ) {
        updateData.verified_at = new Date();
      }

      if (
        updateDriverDto.status === DriverStatus.AVAILABLE ||
        updateDriverDto.status === DriverStatus.BUSY
      ) {
        updateData.last_active_at = new Date();
      }

      const driverToUpdate = await this.driverRepository.preload({
        id: id,
        ...updateData,
      });

      if (!driverToUpdate) {
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      const updatedDriver = await this.driverRepository.save(driverToUpdate);

      return {
        success: true,
        message: 'Driver updated successfully',
        data: updatedDriver,
      };
    } catch (error) {
      this.logger.error(`Failed to update driver with ID: ${id}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        driverId: id,
        updateData: updateDriverDto,
      });
      throw new InternalServerErrorException({
        message: 'Failed to update driver',
        suggestion: 'Please try again later or contact support',
      });
    }
  }

  // delete driver by id
  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if driver exists first
      const existingDriver = await this.driverRepository.findOne({
        where: { id },
      });
      if (!existingDriver) {
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      const result = await this.driverRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete driver with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Driver with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete driver with id ${id}`,
        error: error.message,
      };
    }
  }

  // find drivers by user id
  async getDriversByUserId(userId: number): Promise<ApiResponse<Driver[]>> {
    try {
      const drivers = await this.driverRepository.find({
        where: { user_id: userId },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${drivers.length} drivers for user ${userId}`,
        data: drivers,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch drivers for user ${userId}`,
        error: error.message,
      };
    }
  }

  // find drivers by status
  async getDriversByStatus(
    status: DriverStatus,
  ): Promise<ApiResponse<Driver[]>> {
    try {
      const drivers = await this.driverRepository.find({
        where: { status },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${drivers.length} drivers with status ${status}`,
        data: drivers,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch drivers with status ${status}`,
        error: error.message,
      };
    }
  }

  // find drivers by verification status
  async getDriversByVerificationStatus(
    verificationStatus: DriverVerificationStatus,
  ): Promise<ApiResponse<Driver[]>> {
    try {
      const drivers = await this.driverRepository.find({
        where: { verification_status: verificationStatus },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      });

      return {
        success: true,
        message: `Found ${drivers.length} drivers with verification status ${verificationStatus}`,
        data: drivers,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch drivers with verification status ${verificationStatus}`,
        error: error.message,
      };
    }
  }

  // find available drivers
  async getAvailableDrivers(): Promise<ApiResponse<Driver[]>> {
    try {
      const drivers = await this.driverRepository.find({
        where: {
          status: DriverStatus.AVAILABLE,
          verification_status: DriverVerificationStatus.VERIFIED,
        },
        relations: ['user'],
        select: {
          user: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        order: {
          // rating: 'DESC',
          total_deliveries: 'DESC',
        },
      });

      return {
        success: true,
        message: `Found ${drivers.length} available drivers`,
        data: drivers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch available drivers',
        error: error.message,
      };
    }
  }

  // verify driver
  async verifyDriver(id: number): Promise<ApiResponse<Driver>> {
    try {
      const driver = await this.driverRepository.findOne({ where: { id } });
      if (!driver) {
        throw new NotFoundException(`Driver with id ${id} not found`);
      }

      driver.verification_status = DriverVerificationStatus.VERIFIED;
      driver.verified_at = new Date();

      const updatedDriver = await this.driverRepository.save(driver);

      return {
        success: true,
        message: 'Driver verified successfully',
        data: updatedDriver,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to verify driver with id ${id}`,
        error: error.message,
      };
    }
  }
  // find drivers and their orders

  async getDriversWithOrders(driverId: number): Promise<ApiResponse<Order[]>> {
    try {
      // First check if driver exists
      const driver = await this.driverRepository.findOne({
        where: { id: driverId },
      });
      if (!driver) {
        throw new NotFoundException(`Driver with id ${driverId} not found`);
      }

      // This is a placeholder implementation that returns an empty array
      const orders: Order[] = [];

      return {
        success: true,
        message: `Found ${orders.length} orders for driver ${driverId}`,
        data: orders,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to fetch orders for driver ${driverId}`,
        error: error.message,
      };
    }
  }
}
