import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
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
        select: ['id', 'hashedRefreshToken']
      });
      console.log(`Verification - User ${id} hashedRefreshToken:`, updatedUser?.hashedRefreshToken);
      
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  // Method to sign in the user
  async signIn(createAuthDto: CreateAuthDto) {
    const foundUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: ['id', 'email', 'password', 'role'], // role included for authorization
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
      refreshTokenLength: refreshToken.length 
    });
    
    await this.saveRefreshToken(foundUser.id, refreshToken);
    console.log('Refresh token saved successfully');
    
    return { accessToken, refreshToken };
  }

  // Method to sign out the user
  async signOut(id: number) {
    // Fixed: userId should be number for consistency
    const res = await this.userRepository.update(id, {
      hashedRefreshToken: null,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with id : ${id} signed out successfully` };
  }

  // Method to refresh tokens
  async refreshTokens(id: number, refreshToken: string) {
    const foundUser = await this.userRepository.findOne({
      where: {id: id },
      select: ['id', 'email', 'role', 'hashedRefreshToken'],
    });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!foundUser.hashedRefreshToken) {
      throw new NotFoundException('No refresh token found');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new NotFoundException('Invalid refresh token');
    }
    const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
      foundUser.id,
      foundUser.email,
      foundUser.role,
    );
    await this.saveRefreshToken(foundUser.id, newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  }
}
