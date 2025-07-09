import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Too many requests. Please try again later.';

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip;
  }
}
