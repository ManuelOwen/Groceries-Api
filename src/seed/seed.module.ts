import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from 'src/users/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Location])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
