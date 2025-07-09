import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
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
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  // create location
  async createLocation(
    createLocationDto: CreateLocationDto,
  ): Promise<ApiResponse<Location>> {
    try {
      const newLocation = this.locationRepository.create(createLocationDto);
      const savedLocation = await this.locationRepository.save(newLocation);

      return {
        success: true,
        message: 'Location created successfully',
        data: savedLocation,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      return {
        success: false,
        message: 'Failed to create location',
        error: error.message,
      };
    }
  }

  // find all locations
  async findAll(): Promise<ApiResponse<Location[]>> {
    try {
      const locations = await this.locationRepository.find();

      return {
        success: true,
        message: `Found ${locations.length} locations`,
        data: locations,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch locations',
        error: error.message,
      };
    }
  }

  // find one location by id
  async getLocationById(id: number): Promise<ApiResponse<Location>> {
    try {
      const location = await this.locationRepository.findOne({
        where: { id },
      });

      if (!location) {
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      return {
        success: true,
        message: 'Location found successfully',
        data: location,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find location with id ${id}`,
        error: error.message,
      };
    }
  }

  // update location by id
  async updateLocation(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<ApiResponse<Location>> {
    try {
      // Check if location exists
      const existingLocation = await this.locationRepository.findOne({
        where: { id },
      });
      if (!existingLocation) {
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      const locationToUpdate = await this.locationRepository.preload({
        id: id,
        ...updateLocationDto,
      });

      if (!locationToUpdate) {
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      const updatedLocation =
        await this.locationRepository.save(locationToUpdate);

      return {
        success: true,
        message: 'Location updated successfully',
        data: updatedLocation,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update location with id ${id}`,
        error: error.message,
      };
    }
  }

  // delete location by id
  async deleteLocation(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if location exists first
      const existingLocation = await this.locationRepository.findOne({
        where: { id },
      });
      if (!existingLocation) {
        throw new NotFoundException(`Location with id ${id} not found`);
      }

      const result = await this.locationRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete location with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `Location with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete location with id ${id}`,
        error: error.message,
      };
    }
  }
}
