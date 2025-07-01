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
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('🔍 RolesGuard - Required roles:', requiredRoles);
    
    if (!requiredRoles) {
      console.log('✅ No roles required, allowing access');
      return true;
    }
    
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;
    console.log('👤 User from request:', user);
    
    if (!user) {
      console.log('❌ No user in request');
      return false;
    }
    
    // Since AtStrategy now returns the full user object, we can use it directly
    const hasRole = requiredRoles.some((role) => user.role === role);
    console.log('🔐 Role check:', user.role, 'in', requiredRoles, '=', hasRole);
    return hasRole;
  }
}
