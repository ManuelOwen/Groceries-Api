import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

// Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // create user
  async createUser(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // hash password for authentication
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(newUser);

      // Remove password from response
      const { password, ...userWithoutPassword } = savedUser;

      return {
        success: true,
        message: 'User created successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      return {
        success: false,
        message: 'Failed to create user',
        error: error.message,
      };
    }
  }
  // find all users
  async findAll(): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.userRepository.find({
        select: [
          'id',
          'fullName',
          'email',
          'address',
          'phoneNumber',
          'role',
          'created_at',
          'updated_at',
        ],
      });

      return {
        success: true,
        message: `Found ${users.length} users`,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      };
    }
  }
  // find one user by id
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'fullName',
          'email',
          'address',
          'phoneNumber',
          'role',
          'created_at',
          'updated_at',
        ],
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return {
        success: true,
        message: 'User found successfully',
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to find user with id ${id}`,
        error: error.message,
      };
    }
  }
  // update user by id
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // If password is being updated, hash it
      const updateData = { ...updateUserDto };
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const userToUpdate = await this.userRepository.preload({
        id: id,
        ...updateData,
      });

      if (!userToUpdate) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const updatedUser = await this.userRepository.save(userToUpdate);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        message: 'User updated successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to update user with id ${id}`,
        error: error.message,
      };
    }
  }
  // delete user by id
  async deleteUser(id: number): Promise<ApiResponse<null>> {
    try {
      // Check if user exists first
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        return {
          success: false,
          message: `Failed to delete user with id ${id}`,
          error: 'No rows affected',
        };
      }

      return {
        success: true,
        message: `User with id ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        success: false,
        message: `Failed to delete user with id ${id}`,
        error: error.message,
      };
    }
  }
}
