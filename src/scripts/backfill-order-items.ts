import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

async function backfillOrderItems() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const orderRepo = dataSource.getRepository(Order);
  const productRepo = dataSource.getRepository(Product);

  const orders = await orderRepo.find();

  for (const order of orders) {
    let updated = false;
    if (Array.isArray(order.items)) {
      const newItems: any[] = [];
      for (const item of order.items) {
        // Only backfill if missing product_name or price
        if (!item.product_name || !item.price) {
          const product = await productRepo.findOne({ where: { id: item.id } });
          if (product) {
            newItems.push({
              ...item,
              product_name: product.product_name,
              price: product.price,
            });
            updated = true;
          } else {
            newItems.push(item);
          }
        } else {
          newItems.push(item);
        }
      }
      if (updated) {
        order.items = newItems;
        await orderRepo.save(order);
        console.log(`Updated order #${order.id}`);
      }
    }
  }

  await app.close();
  console.log('Backfill complete!');
}

backfillOrderItems();
