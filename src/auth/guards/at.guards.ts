import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';

export type JWTPayload = {
  sub: number;
  role: string;
  email: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_ACCESS_TOKEN_SECRET is not defined in environment variables',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //bearer token extraction from Authorization header
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'), // Access token secret key
    });
  }

  async validate(payload: JWTPayload) {
    console.log('🔑 AtStrategy - JWT payload received:', payload);
    
    // Load the full user from database to ensure it exists and is valid
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'role', 'fullName'],
    });

    if (!user) {
      console.log('❌ AtStrategy - User not found in database');
      return null; // This will cause authentication to fail
    }

    console.log('✅ AtStrategy - User found and validated:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return the user object that will be attached to request.user
    return {
      id: user.id,
      sub: user.id, // Keep sub for compatibility
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
  }
}
