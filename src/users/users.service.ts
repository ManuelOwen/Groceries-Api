import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository, QueryFailedError } from 'typeorm';

// Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // create user
  async createUser(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const { email, password, fullName, phoneNumber } = createUserDto;

    try {
      // Input validation
      if (!email || !password || !fullName) {
        this.logger.warn(
          `Invalid input data for user creation: ${JSON.stringify({ email: !!email, password: !!password, fullName: !!fullName })}`,
        );
        throw new BadRequestException(
          'Email, password, and full name are required',
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.logger.warn(`Invalid email format provided: ${email}`);
        throw new BadRequestException('Invalid email format');
      }

      // Validate password strength
      if (password.length < 6) {
        this.logger.warn('Password too short');
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // Check if user already exists with detailed logging
      this.logger.log(`Checking if user exists with email: ${email}`);
      const existingUser = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        this.logger.warn(
          `User registration attempt with existing email: ${email}`,
        );
        throw new ConflictException({
          message: 'A user with this email address already exists',
          email: email,
          suggestion: 'Please use a different email address or try logging in',
        });
      }

      // Check if phone number already exists
      if (phoneNumber) {
        this.logger.log(`Checking if phone number exists: ${phoneNumber}`);
        const existingPhoneUser = await this.userRepository.findOne({
          where: { phoneNumber: phoneNumber.trim() },
        });

        if (existingPhoneUser) {
          this.logger.warn(
            `User registration attempt with existing phone number: ${phoneNumber}`,
          );
          throw new ConflictException({
            message: 'A user with this phone number already exists',
            phoneNumber: phoneNumber,
            suggestion: 'Please use a different phone number',
          });
        }
      }

      // Hash password with error handling
      let hashedPassword: string;
      try {
        hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security
      } catch (hashError) {
        this.logger.error('Password hashing failed', hashError.stack);
        throw new InternalServerErrorException('Failed to secure password');
      }

      // Create user entity with sanitized data
      const userData = {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        address: createUserDto.address,
        password: hashedPassword,
        phoneNumber: phoneNumber?.trim() || createUserDto.phoneNumber,
        role: createUserDto.role,
      };

      const newUser = this.userRepository.create(userData);

      // Save user with comprehensive error handling
      let savedUser: User;
      try {
        savedUser = await this.userRepository.save(newUser);
        this.logger.log(
          `User created successfully with ID: ${savedUser.id}, Email: ${savedUser.email}`,
        );
      } catch (saveError) {
        // Handle specific database errors
        if (saveError instanceof QueryFailedError) {
          // PostgreSQL unique constraint violation
          if (
            saveError.message.includes(
              'duplicate key value violates unique constraint',
            )
          ) {
            if (saveError.message.includes('email')) {
              this.logger.warn(
                `Database unique constraint violation for email: ${email}`,
              );
              throw new ConflictException({
                message: 'Email address is already registered',
                email: email,
                suggestion: 'Please use a different email address',
              });
            }
            if (saveError.message.includes('phone')) {
              this.logger.warn(
                `Database unique constraint violation for phone: ${phoneNumber}`,
              );
              throw new ConflictException({
                message: 'Phone number is already registered',
                phoneNumber: phoneNumber,
                suggestion: 'Please use a different phone number',
              });
            }
          }

          // Handle other database constraints
          if (saveError.message.includes('not-null constraint')) {
            this.logger.error(
              'Required field missing during user creation',
              saveError.message,
            );
            throw new BadRequestException('Required fields are missing');
          }
        }

        // Log the full error for debugging
        this.logger.error('Database save operation failed', {
          error: saveError.message,
          stack: saveError.stack,
          userData: { email, fullName, phoneNumber },
        });

        throw new InternalServerErrorException({
          message: 'Failed to create user account',
          suggestion:
            'Please try again later or contact support if the problem persists',
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        success: true,
        message: 'User account created successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      // Re-throw known exceptions
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Handle unexpected errors
      this.logger.error('Unexpected error during user creation', {
        error: error.message,
        stack: error.stack,
        userData: { email, fullName, phoneNumber },
      });

      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the user account',
        suggestion: 'Please try again later or contact support',
      });
    }
  }
  // find all users
  async findAll(): Promise<ApiResponse<User[]>> {
    try {
      this.logger.log('Fetching all users');

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

      this.logger.log(`Successfully retrieved ${users.length} users`);

      return {
        success: true,
        message: `Found ${users.length} users`,
        data: users,
      };
    } catch (error) {
      this.logger.error('Failed to fetch users', {
        error: error.message,
        stack: error.stack,
      });

      throw new InternalServerErrorException({
        message: 'Failed to retrieve users',
        suggestion: 'Please try again later or contact support',
      });
    }
  }
  // find one user by id
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      // Validate input
      if (!id || isNaN(id) || id <= 0) {
        this.logger.warn(`Invalid user ID provided: ${id}`);
        throw new BadRequestException('Invalid user ID provided');
      }

      this.logger.log(`Fetching user with ID: ${id}`);

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
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException({
          message: `User with ID ${id} not found`,
          userId: id,
          suggestion: 'Please verify the user ID and try again',
        });
      }

      this.logger.log(`Successfully retrieved user with ID: ${id}`);

      return {
        success: true,
        message: 'User found successfully',
        data: user,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Failed to find user with ID: ${id}`, {
        error: error.message,
        stack: error.stack,
        userId: id,
      });

      throw new InternalServerErrorException({
        message: `Failed to retrieve user with ID ${id}`,
        suggestion: 'Please try again later or contact support',
      });
    }
  }
  // update user by id
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      // Validate input
      if (!id || isNaN(id) || id <= 0) {
        this.logger.warn(`Invalid user ID provided for update: ${id}`);
        throw new BadRequestException('Invalid user ID provided');
      }

      if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
        this.logger.warn(`No update data provided for user ID: ${id}`);
        throw new BadRequestException('No update data provided');
      }

      this.logger.log(`Updating user with ID: ${id}`);

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        this.logger.warn(`User not found for update with ID: ${id}`);
        throw new NotFoundException({
          message: `User with ID ${id} not found`,
          userId: id,
          suggestion: 'Please verify the user ID and try again',
        });
      }

      // If email is being updated, check for conflicts
      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailExists = await this.userRepository.findOne({
          where: { email: updateUserDto.email.toLowerCase().trim() },
        });

        if (emailExists) {
          this.logger.warn(
            `Email conflict during update for user ID: ${id}, email: ${updateUserDto.email}`,
          );
          throw new ConflictException({
            message: 'Email address is already in use by another user',
            email: updateUserDto.email,
            suggestion: 'Please use a different email address',
          });
        }
      }

      // Prepare update data
      const updateData = { ...updateUserDto };

      // If password is being updated, hash it
      if (updateUserDto.password) {
        try {
          updateData.password = await bcrypt.hash(updateUserDto.password, 12);
          this.logger.log(`Password updated for user ID: ${id}`);
        } catch (hashError) {
          this.logger.error(
            'Password hashing failed during update',
            hashError.stack,
          );
          throw new InternalServerErrorException(
            'Failed to secure new password',
          );
        }
      }

      // Sanitize email if provided
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim();
      }

      // Sanitize other string fields
      if (updateData.fullName) {
        updateData.fullName = updateData.fullName.trim();
      }
      if (updateData.phoneNumber) {
        updateData.phoneNumber = updateData.phoneNumber.trim();
      }

      let userToUpdate: User | undefined;
      try {
        userToUpdate = await this.userRepository.preload({
          id: id,
          ...updateData,
        });
      } catch (preloadError) {
        this.logger.error('Failed to preload user data for update', {
          error: preloadError.message,
          userId: id,
        });
        throw new InternalServerErrorException(
          'Failed to prepare user data for update',
        );
      }

      if (!userToUpdate) {
        this.logger.error(`Preload returned null for user ID: ${id}`);
        throw new NotFoundException({
          message: `User with ID ${id} not found`,
          userId: id,
        });
      }

      let updatedUser: User;
      try {
        updatedUser = await this.userRepository.save(userToUpdate);
        this.logger.log(`User updated successfully with ID: ${id}`);
      } catch (saveError) {
        // Handle specific database errors
        if (saveError instanceof QueryFailedError) {
          if (
            saveError.message.includes(
              'duplicate key value violates unique constraint',
            )
          ) {
            if (saveError.message.includes('email')) {
              this.logger.warn(
                `Database unique constraint violation during update for email: ${updateData.email}`,
              );
              throw new ConflictException({
                message: 'Email address is already registered',
                email: updateData.email,
                suggestion: 'Please use a different email address',
              });
            }
          }
        }

        this.logger.error('Database save operation failed during update', {
          error: saveError.message,
          stack: saveError.stack,
          userId: id,
        });

        throw new InternalServerErrorException({
          message: 'Failed to save user updates',
          suggestion: 'Please try again later or contact support',
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        message: 'User updated successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(`Unexpected error during user update with ID: ${id}`, {
        error: error.message,
        stack: error.stack,
        userId: id,
      });

      throw new InternalServerErrorException({
        message: `Failed to update user with ID ${id}`,
        suggestion: 'Please try again later or contact support',
      });
    }
  }
  // delete user by id
  async deleteUser(id: number): Promise<ApiResponse<null>> {
    try {
      // Validate input
      if (!id || isNaN(id) || id <= 0) {
        this.logger.warn(`Invalid user ID provided for deletion: ${id}`);
        throw new BadRequestException('Invalid user ID provided');
      }

      this.logger.log(`Attempting to delete user with ID: ${id}`);

      // Check if user exists first
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        this.logger.warn(`User not found for deletion with ID: ${id}`);
        throw new NotFoundException({
          message: `User with ID ${id} not found`,
          userId: id,
          suggestion: 'Please verify the user ID and try again',
        });
      }

      // Prevent deletion of admin users (optional business rule)
      if (existingUser.role === 'admin') {
        this.logger.warn(`Attempt to delete admin user with ID: ${id}`);
        throw new BadRequestException({
          message: 'Admin users cannot be deleted',
          suggestion: 'Please contact system administrator',
        });
      }

      let deleteResult;
      try {
        deleteResult = await this.userRepository.delete(id);
      } catch (deleteError) {
        // Handle foreign key constraint violations
        if (deleteError instanceof QueryFailedError) {
          if (deleteError.message.includes('foreign key constraint')) {
            this.logger.warn(
              `Cannot delete user due to foreign key constraints, ID: ${id}`,
            );
            throw new ConflictException({
              message: 'Cannot delete user as they have associated records',
              suggestion: 'Please ensure all related data is removed first',
            });
          }
        }

        this.logger.error('Database delete operation failed', {
          error: deleteError.message,
          stack: deleteError.stack,
          userId: id,
        });

        throw new InternalServerErrorException({
          message: 'Failed to delete user',
          suggestion: 'Please try again later or contact support',
        });
      }

      if (deleteResult.affected === 0) {
        this.logger.error(
          `Delete operation affected 0 rows for user ID: ${id}`,
        );
        throw new InternalServerErrorException({
          message: `Failed to delete user with ID ${id}`,
          suggestion: 'User may have been deleted by another process',
        });
      }

      this.logger.log(`User deleted successfully with ID: ${id}`);

      return {
        success: true,
        message: `User with ID ${id} deleted successfully`,
        data: null,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(
        `Unexpected error during user deletion with ID: ${id}`,
        {
          error: error.message,
          stack: error.stack,
          userId: id,
        },
      );

      throw new InternalServerErrorException({
        message: `Failed to delete user with ID ${id}`,
        suggestion: 'Please try again later or contact support',
      });
    }
  }
}
