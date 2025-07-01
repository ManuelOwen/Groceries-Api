import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend the Request interface to include the user object
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
  };
}

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user.sub;
  },
);
