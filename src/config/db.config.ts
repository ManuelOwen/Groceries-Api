import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT
  // ? parseInt(process.env.DB_PORT, 10)
  // : undefined,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_DATABASE,
  url: process.env.DATABASE_URL,
  ssl: true,

  // autoLoadEntities: true,
  // entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // synchronize: process.env.DB_SYNC === 'true' ? true : false,
  // logging: process.env.DB_LOGGING === 'true' ? true : false,
  // migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false, // Disable temporarily to fix schema issues
  logging: false,
};
