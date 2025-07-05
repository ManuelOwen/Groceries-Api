import { DataSource } from 'typeorm';
import { cleanupDuplicatePhoneNumbers } from './cleanup-duplicates';
import { User } from '../users/entities/user.entity';
import { Location } from '../location/entities/location.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Feedback } from '../feedbacks/entities/feedback.entity';
import { CustomersSupport } from '../customers-support/entities/customers-support.entity';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'Groceries',
    entities: [User, Location, Payment, Order, Product, Feedback, CustomersSupport],
    synchronize: false, // Don't sync during cleanup
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');
    
    await cleanupDuplicatePhoneNumbers(dataSource);
    
    console.log('Cleanup script completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await dataSource.destroy();
  }
}

main().catch(console.error);
