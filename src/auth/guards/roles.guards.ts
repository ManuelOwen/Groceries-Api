import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../users/entities/user.entity';
import { Request } from 'express';

interface UserRequest extends Request {
  user?: {
    id: number;
    sub: number;
    email: string;
    role: Role;
    fullName: string;
    address: string;
    phoneNumber: string;
    created_at: Date;
    updated_at: Date;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('🔍 RolesGuard - Required roles:', requiredRoles);
    console.log(
      '🔍 RolesGuard - Required roles types:',
      requiredRoles?.map((r) => typeof r),
    );

    if (!requiredRoles) {
      console.log('✅ No roles required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;
    console.log('👤 User from request:', user);
    console.log('👤 User role type:', typeof user?.role);
    console.log('👤 User role value:', user?.role);

    if (!user) {
      console.log('❌ No user in request');
      return false;
    }

    // Compare the user's role with required roles
    const hasRole = requiredRoles.some((role) => {
      const comparison = user.role === role;
      console.log(
        `🔐 Role comparison: ${user.role} === ${role} = ${comparison}`,
      );
      return comparison;
    });
    console.log('🔐 Final role check result:', hasRole);
    return hasRole;
  }
}
