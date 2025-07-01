import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('🔒 AtGuard - isPublic:', isPublic);

    if (isPublic) {
      console.log('✅ Public route, allowing access');
      return true;
    }

    console.log('🔑 AtGuard - Checking JWT authentication...');
    return super.canActivate(context);
  }
}
