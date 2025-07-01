import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend Request with user
interface AuthenticatedRequest extends Request {
  user: {
    [key: string]: string | number;
    sub: number;
    email: string;
  };
}

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (data) {
      return user[data as keyof typeof user];
    }

    return user;
  },
);
