import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Role } from '../users/entities/user.entity';
import { Location } from '../location/entities/location.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    this.logger.log('Seeding database...');

    try {
      // Clear existing data
      this.logger.log('Clearing existing data from database...');
      await this.userRepository.clear();
      await this.locationRepository.clear();
      
      // Clear products using dataSource
      const productRepository = this.dataSource.getRepository('Product');
      await productRepository.clear();
      this.logger.log('Existing data cleared successfully');

      // Hash passwords
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Seed users
      this.logger.log('Seeding users...');
      const users = [
        {
          email: 'ten@example.com',
          fullName: 'Ten User',
          address: '123 Main St, City, Country',
          password: hashedPassword,
          phoneNumber: '123-456-7890',
          role: Role.USER,
        },
        {
          email: 'mari@example.com',
          fullName: 'Mari User',
          address: '456 Elm St, City, Country',
          password: hashedPassword,
          phoneNumber: '987-654-3210',
          role: Role.ADMIN,
        },
      ];

      // Seed locations
      this.logger.log('Seeding locations...');
      const locations = [
        {
          location_name: 'Central Market',
          address: '123 Main St, Nairobi, Kenya',
          postal_code: '00100',

         
        },
        {
          location_name: 'Westlands Shopping Center',
          address: '456 Westlands Rd, Nairobi, Kenya',
          postal_code: '00101',
          
        },
        {
          location_name: 'Eastleigh Market',
          address: '789 Eastleigh Ave, Nairobi, Kenya',
          postal_code: '00102',
         
        },
      ];

      // Seed products
      this.logger.log('Seeding products...');
      const products = [
        {
          product_name: 'kales',
          price: 100,
          category: 'vegetables',
          imageUrl: 'https://example.com/kales.jpg',
          availability: true,
        },
        {
          product_name: 'spinach',
          price: 80,
          category: 'vegetables',
          imageUrl: 'https://example.com/spinach.jpg',
          availability: true,
        },
      ];
      // seed locations
      
     


      // Save all data
      const savedUsers = await this.userRepository.save(users);
      const savedLocations = await this.locationRepository.save(locations);
      const savedProducts = await productRepository.save(products);

      this.logger.log(
        `Users seeded successfully. Created ${savedUsers.length} users.`,
      );
      this.logger.log(
        `Locations seeded successfully. Created ${savedLocations.length} locations.`,
      );
      this.logger.log(
        `Products seeded successfully. Created ${savedProducts.length} products.`,
      );
      this.logger.log('Database seeding completed successfully');

      return {
        success: true,
        message: `Successfully seeded ${savedUsers.length} users, ${savedLocations.length} locations, and ${savedProducts.length} products`,
        users: savedUsers.map((user) => ({
          id: user.id,
          email: user.email,
          role: user.role,
        })),
        locations: savedLocations.map((location) => ({
          id: location.id,
          location_name: location.location_name,
          address: location.address,
          postal_code: location.postal_code,
        })),
        products: savedProducts.map((product) => ({
          id: product.id,
          product_name: product.product_name,
          category: product.category,
        })),
      };
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }
}
