import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
          ? parseInt(process.env.DB_PORT, 10)
          : undefined,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.DB_SYNC === 'true' ? true : false,
        logging: process.env.DB_LOGGING === 'true' ? true : false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      }),
    }),
  ],
})
export class DatabaseModule {}
