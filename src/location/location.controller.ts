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
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
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

@Controller('location')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication and RolesGuard for authorization
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // create location
  @Post()
  @Roles(Role.ADMIN) // Only admins can create locations
  create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<ApiResponse<Location>> {
    return this.locationService.createLocation(createLocationDto);
  }

  // get all locations
  @Get()
  @Public() // Public endpoint - anyone can view locations
  async findAll(): Promise<ApiResponse<Location[]>> {
    return this.locationService.findAll();
  }

  // get location by id
  @Get(':id')
  @Public() // Public endpoint - anyone can view a specific location
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Location>> {
    return this.locationService.getLocationById(id);
  }

  // update location by id
  @Put(':id')
  @Roles(Role.ADMIN) // Only admins can update locations
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<ApiResponse<Location>> {
    return this.locationService.updateLocation(id, updateLocationDto);
  }

  // delete location by id
  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete locations
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.locationService.deleteLocation(id);
  }
}
