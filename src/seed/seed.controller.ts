import { Controller, Post, HttpStatus, HttpCode, Logger } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  private readonly logger = new Logger(SeedController.name);

  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async seed() {
    this.logger.log('Seed endpoint called');
    return this.seedService.seed();
  }

  @Post('payments')
  @HttpCode(HttpStatus.OK)
  async seedPayments() {
    this.logger.log('Seed payments endpoint called');
    return this.seedService.seedPayments();
  }

  @Post('orders')
  @HttpCode(HttpStatus.OK)
  async seedOrders() {
    this.logger.log('Seed orders endpoint called');
    return this.seedService.seedOrders();
  }

  @Post('feedbacks')
  @HttpCode(HttpStatus.OK)
  async seedFeedbacks() {
    this.logger.log('Seed feedbacks endpoint called');
    return this.seedService.seedFeedbacks();
  }

  @Post('customers-support')
  @HttpCode(HttpStatus.OK)
  async seedCustomersSupport() {
    this.logger.log('Seed customer support endpoint called');
    return this.seedService.seedCustomersSupport();
  }

  // seed users
  @Post('users')
  @HttpCode(HttpStatus.OK)
  async seedUsers() {
    this.logger.log('seed endpoint called');
    return this.seedService.seedUsers();
  }
}
