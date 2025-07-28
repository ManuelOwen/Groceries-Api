import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../users/entities/user.entity';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Helper method to generate access and refresh tokens for the user
  private async getTokens(userId: number, email: string, role: Role) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
          role: role,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
          role: role,
        },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  // Helper method to hash the password using bcrypt
  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
  }

  // Helper method to save hashed refresh token in the database
  private async saveRefreshToken(id: number, refreshToken: string) {
    try {
      console.log(`Saving refresh token for user ID: ${id}`);
      console.log(`Original refresh token: ${refreshToken}`);

      const hashedRefreshToken = await this.hashData(refreshToken);
      console.log(`Hashed refresh token: ${hashedRefreshToken}`);

      const result = await this.userRepository.update(id, {
        hashedRefreshToken: hashedRefreshToken,
      });

      console.log(`Update result:`, result);

      if (result.affected === 0) {
        throw new Error(`No user found with ID ${id} to update refresh token`);
      }

      // Verify the token was saved
      const updatedUser = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'hashedRefreshToken'],
      });
      console.log(
        `Verification - User ${id} hashedRefreshToken:`,
        updatedUser?.hashedRefreshToken,
      );
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }
  // Method to register a new user
  async register(createAuthDto: CreateAuthDto) {
    const { email, password, fullName, address, phoneNumber } = createAuthDto;

    try {
      // Input validation
      if (!email || !password || !fullName || !address || !phoneNumber) {
        this.logger.warn(
          `Invalid input data for user registration: ${JSON.stringify({
            email: !!email,
            password: !!password,
            fullName: !!fullName,
            address: !!address,
            phoneNumber: !!phoneNumber,
          })}`,
        );
        throw new BadRequestException(
          'Email, password, full name, address, and phone number are required',
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.logger.warn(
          `Invalid email format provided during registration: ${email}`,
        );
        throw new BadRequestException('Invalid email format');
      }

      // Validate password strength
      if (password.length < 6) {
        this.logger.warn('Password too short during registration');
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // Check if user already exists
      this.logger.log(
        `Checking if user exists during registration with email: ${email}`,
      );
      const existingUser = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        this.logger.warn(`Registration attempt with existing email: ${email}`);
        throw new ConflictException({
          message: 'A user with this email address already exists',
          email: email,
          suggestion: 'Please use a different email address or try logging in',
        });
      }

      // Check if phone number already exists
      if (phoneNumber) {
        this.logger.log(
          `Checking if phone number exists during registration: ${phoneNumber}`,
        );
        const existingPhoneUser = await this.userRepository.findOne({
          where: { phoneNumber: phoneNumber.trim() },
        });

        if (existingPhoneUser) {
          this.logger.warn(
            `Registration attempt with existing phone number: ${phoneNumber}`,
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
        hashedPassword = await this.hashData(password);
      } catch (hashError) {
        this.logger.error(
          'Password hashing failed during registration',
          hashError instanceof Error ? hashError.stack : 'Unknown error',
        );
        throw new InternalServerErrorException('Failed to secure password');
      }

      // Create user entity with sanitized data
      const userData = {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: fullName.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        role: createAuthDto.role || Role.USER, // Default to USER role if not specified
      };

      const newUser = this.userRepository.create(userData);

      // Save user with comprehensive error handling
      let savedUser: User;
      try {
        savedUser = await this.userRepository.save(newUser);
        this.logger.log(
          `User registered successfully with ID: ${savedUser.id}, Email: ${savedUser.email}`,
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
                `Database unique constraint violation during registration for email: ${email}`,
              );
              throw new ConflictException({
                message: 'Email address is already registered',
                email: email,
                suggestion:
                  'Please use a different email address or try logging in',
              });
            }
            if (saveError.message.includes('phone')) {
              this.logger.warn(
                `Database unique constraint violation during registration for phone: ${phoneNumber}`,
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
              'Required field missing during user registration',
              saveError.message,
            );
            throw new BadRequestException('Required fields are missing');
          }
        }

        // Log the full error for debugging
        this.logger.error(
          'Database save operation failed during registration',
          {
            error: saveError instanceof Error ? saveError.message : 'Unknown error',
            stack: saveError instanceof Error ? saveError.stack : 'No stack trace',
            userData: { email, fullName, phoneNumber },
          },
        );

        throw new InternalServerErrorException({
          message: 'Failed to create user account',
          suggestion:
            'Please try again later or contact support if the problem persists',
        });
      }

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          id: savedUser.id,
          email: savedUser.email,
          role: savedUser.role,
        },
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
      this.logger.error('Unexpected error during user registration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        userData: { email, fullName, phoneNumber },
      });
      this.logger.error('Unexpected error during user registration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        userData: { email },
      });

      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the user account',
        suggestion: 'Please try again later or contact support',
      });
    }
  }

  // Method to sign in the user
  async signIn(createAuthDto: LoginDto) {
    const foundUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'fullName',
        'address',
        'phoneNumber',
        // 'created_at',
        // 'updated_at',
      ], // include all relevant fields
    });
    if (!foundUser) {
      throw new NotFoundException(
        `User with email ${createAuthDto.email} not found`,
      );
    }
    const foundPassword = await bcrypt.compare(
      createAuthDto.password,
      foundUser.password,
    );
    if (!foundPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log('Password validation successful - user authenticated');
    const { accessToken, refreshToken } = await this.getTokens(
      foundUser.id,
      foundUser.email,
      foundUser.role,
    );
    console.log(`Generated tokens for user ${foundUser.id}:`, {
      accessTokenLength: accessToken.length,
      refreshTokenLength: refreshToken.length,
    });

    await this.saveRefreshToken(foundUser.id, refreshToken);
    console.log('Refresh token saved successfully');
    console.log(foundUser);
    return {
      accessToken,
      refreshToken,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        address: foundUser.address,
        phoneNumber: foundUser.phoneNumber,
        role: foundUser.role, // should be 'user', 'admin', or 'driver'
        // created_at: foundUser.created_at,
        // updated_at: foundUser.updated_at,
      },
    };
  }

  // Method to sign out the user
  async signOut(id: number) {
    // Fixed: userId should be number for consistency
    const res = await this.userRepository.update(id, {
      // hashedRefreshToken: null,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with id : ${id} signed out successfully` };
  }

  // Method to refresh tokens
  async refreshTokens(id: number, _refreshToken: string) {
    const foundUser = await this.userRepository.findOne({
      where: { id: id },
      // select: ['id', 'email', 'role', 'hashedRefreshToken'],
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // if (!foundUser.hashedRefreshToken) {
    throw new NotFoundException('No refresh token found');
  }
}
// const refreshTokenMatches = await bcrypt.compare(
//   refreshToken,
//   foundUser.hashedRefreshToken,
// );

//     if (!refreshTokenMatches) {
//       throw new NotFoundException('Invalid refresh token');
//     }
//     const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
//       foundUser.id,
//       foundUser.email,
//       foundUser.role,
//     );
//     await this.saveRefreshToken(foundUser.id, newRefreshToken);
//     return { accessToken, refreshToken: newRefreshToken };
//   }
// }
