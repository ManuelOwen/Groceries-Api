import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  // Query,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Role } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards';
import { AtGuard } from '../auth/token/token.guard';
import { Public, Roles } from '../auth/decorators';

// Define ApiResponse interface to match the service
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Controller('users')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard) // Use AtGuard for authentication
// Use RolesGuard for authorization
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  //  create user
  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    return this.usersService.createUser(createUserDto);
  }
  // get all users
  @Get()
  @Public()
  // @Roles(Role.ADMIN) // Only admins can see all users
  async findAllUsers(): Promise<ApiResponse<User[]>> {
    return this.usersService.findAll();
  }
  // get user by id
  @Get(':id')
  @Roles(Role.ADMIN)
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<User>> {
    return this.usersService.getUserById(id);
  }
  //  update user by id
  @Put(':id')
  @Roles(Role.ADMIN, Role.USER, Role.DRIVER) // Admins can update any user, users can update themselves (logic in service)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Only admins can delete users
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    return this.usersService.deleteUser(id);
  }
}
