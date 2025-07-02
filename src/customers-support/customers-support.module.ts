import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersSupportService } from './customers-support.service';
import { CustomersSupportController } from './customers-support.controller';
import { CustomersSupport } from './entities/customers-support.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomersSupport])],
  controllers: [CustomersSupportController],
  providers: [CustomersSupportService],
  exports: [CustomersSupportService], // Export service for use in other modules
})
export class CustomersSupportModule {}
