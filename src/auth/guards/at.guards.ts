import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';

export type JWTPayload = {
  sub: number;
  role: Role;
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
    console.log('🔑 AtStrategy - Payload role type:', typeof payload.role);
    console.log('🔑 AtStrategy - Payload role value:', payload.role);

    // Load the full user from database to ensure it exists and is valid
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      console.log('❌ AtStrategy - User not found in database');
      return null; // This will cause authentication to fail
    }

    console.log('✅ AtStrategy - User found and validated:', {
      id: user.id,
      email: user.email,
      role: user.role,
      roleType: typeof user.role,
      fullName: user.fullName,
    });

    // Return the complete user object that will be attached to request.user
    const userObject = {
      id: user.id,
      sub: user.id, // Keep sub for compatibility
      email: user.email,
      role: user.role, // This will be the Role enum value
      fullName: user.fullName,
      address: user.address,
      phoneNumber: user.phoneNumber,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    console.log('🔑 AtStrategy - Returning user object:', userObject);
    return userObject;
  }
}
