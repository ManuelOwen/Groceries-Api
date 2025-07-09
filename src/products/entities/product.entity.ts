import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum ProductCategory{
  FRUIT = 'fruit',
  VEGETABLE = 'vegetable',
  DAIRY = 'dairy',
  BAKERY = 'bakery',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  BEVERAGE = 'beverage',
  SNACK = 'snack',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, default: '', nullable: false })
  product_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: false })
  inStock: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: ProductCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
