import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from 'src/users/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { CustomersSupport } from 'src/customers-support/entities/customers-support.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Location, Payment, Order, Feedback, CustomersSupport])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
