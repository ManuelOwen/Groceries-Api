import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Role } from '../users/entities/user.entity';
import { Location } from '../location/entities/location.entity';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../payments/entities/payment.entity';
import {
  Order,
  OrderStatus,
  OrderPriority,
} from '../orders/entities/order.entity';
import {
  Feedback,
  FeedbackRating,
  FeedbackStatus,
} from '../feedbacks/entities/feedback.entity';
import {
  CustomersSupport,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
} from '../customers-support/entities/customers-support.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(CustomersSupport)
    private readonly customersSupportRepository: Repository<CustomersSupport>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    this.logger.log('Seeding database...');

    try {
      // Clear existing data
      this.logger.log('Clearing existing data from database...');
      await this.customersSupportRepository.clear();
      await this.feedbackRepository.clear();
      await this.userRepository.clear();
      await this.locationRepository.clear();
      await this.paymentRepository.clear();
      await this.orderRepository.clear();

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
          email: 'ten@gmail.com',
          fullName: 'Ten User',
          address: '123 Main St, City, Country',
          password: hashedPassword,
          phoneNumber: '+254766558889',
          role: Role.USER,
        },
        {
          email: 'mari@example.com',
          fullName: 'Mari User',
          address: '456 Elm St, City, Country',
          password: hashedPassword,
          phoneNumber: '+254756665443',
          role: Role.ADMIN,
        },
        {
          email: 'driver@example.com',
          fullName: 'Test Driver',
          address: '789 Driver St, City, Country',
          password: hashedPassword,
          phoneNumber: '+254712345678',
          role: Role.DRIVER,
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

      // Seed payments (after users are created)
      this.logger.log('Seeding payments...');
      const payments = [
        {
          amount: 250.0,
          payment_method: PaymentMethod.MPESA,
          status: PaymentStatus.COMPLETED,
          description: 'Payment for vegetables',
          user_id: savedUsers[0].id, // Ten User
        },
        {
          amount: 150.5,
          payment_method: PaymentMethod.CARD,
          status: PaymentStatus.PENDING,
          description: 'Payment for fruits',
          user_id: savedUsers[0].id, // Ten User
        },
        {
          amount: 500.0,
          payment_method: PaymentMethod.MPESA,
          status: PaymentStatus.COMPLETED,
          description: 'Bulk order payment',
          user_id: savedUsers[1].id, // Mari User (Admin)
        },
      ];

      const savedPayments = await this.paymentRepository.save(payments);

      // Seed orders (after users are created)
      this.logger.log('Seeding orders...');
      const orders = [
        {
          total_amount: 125.5,
          status: OrderStatus.CONFIRMED,
          priority: OrderPriority.NORMAL,
          shipping_address: '123 Main St, City, Country',
          billing_address: '123 Main St, City, Country',
          notes: 'Please deliver in the morning',
          user_id: savedUsers[0].id, // Ten User
        },
        {
          total_amount: 89.99,
          status: OrderStatus.PROCESSING,
          priority: OrderPriority.HIGH,
          shipping_address: '456 Elm St, City, Country',
          billing_address: '456 Elm St, City, Country',
          notes: 'Urgent delivery required',
          user_id: savedUsers[1].id, // Mari User (Admin)
        },
        {
          total_amount: 200.0,
          status: OrderStatus.SHIPPED,
          priority: OrderPriority.NORMAL,
          shipping_address: '123 Main St, City, Country',
          billing_address: '123 Main St, City, Country',
          notes: 'Handle with care',
          user_id: savedUsers[0].id, // Ten User
        },
        {
          total_amount: 45.75,
          status: OrderStatus.DELIVERED,
          priority: OrderPriority.LOW,
          shipping_address: '456 Elm St, City, Country',
          billing_address: '456 Elm St, City, Country',
          notes: 'Thank you for your order',
          user_id: savedUsers[1].id, // Mari User (Admin)
        },
        {
          total_amount: 75.25,
          status: OrderStatus.PENDING,
          priority: OrderPriority.NORMAL,
          shipping_address: '789 Driver St, City, Country',
          billing_address: '789 Driver St, City, Country',
          notes: 'Driver test order 1',
          user_id: savedUsers[2].id, // Test Driver
        },
        {
          total_amount: 150.0,
          status: OrderStatus.CONFIRMED,
          priority: OrderPriority.HIGH,
          shipping_address: '789 Driver St, City, Country',
          billing_address: '789 Driver St, City, Country',
          notes: 'Driver test order 2',
          user_id: savedUsers[2].id, // Test Driver
        },
      ];

      const savedOrders = await this.orderRepository.save(orders);

      // Seed feedbacks
      this.logger.log('Seeding feedbacks...');
      const feedbacks = [
        {
          message:
            'Excellent service! Fast delivery and great product quality.',
          rating: FeedbackRating.FIVE,
          subject: 'Amazing Experience',
          status: FeedbackStatus.REVIEWED,
          user_id: savedUsers[0].id, // Ten User
          admin_response:
            'Thank you for your positive feedback! We appreciate your business.',
        },
        {
          message: 'Good overall experience, but delivery could be faster.',
          rating: FeedbackRating.FOUR,
          subject: 'Good Service',
          status: FeedbackStatus.PENDING,
          user_id: savedUsers[1].id, // Mari User (Admin)
        },
        {
          message: 'Average service. The product was okay but not exceptional.',
          rating: FeedbackRating.THREE,
          subject: 'Average Experience',
          status: FeedbackStatus.PENDING,
          user_id: savedUsers[0].id, // Ten User
        },
        {
          message: 'Poor delivery experience. The package was damaged.',
          rating: FeedbackRating.TWO,
          subject: 'Delivery Issues',
          status: FeedbackStatus.RESOLVED,
          user_id: savedUsers[1].id, // Mari User (Admin)
          admin_response:
            'We apologize for the delivery issues. We have improved our packaging process.',
        },
        {
          message: 'Outstanding customer support and product quality!',
          rating: FeedbackRating.FIVE,
          subject: 'Excellent Support',
          status: FeedbackStatus.REVIEWED,
          user_id: savedUsers[0].id, // Ten User
          admin_response:
            'We are delighted to hear about your positive experience!',
        },
      ];

      const savedFeedbacks = await this.feedbackRepository.save(feedbacks);

      // Seed customer support tickets
      this.logger.log('Seeding customer support tickets...');
      const supportTickets = [
        {
          subject: 'Order delivery delay',
          description:
            'My order was supposed to be delivered yesterday but I have not received it yet. Could you please check the status?',
          priority: SupportTicketPriority.HIGH,
          category: SupportTicketCategory.ORDER_ISSUE,
          status: SupportTicketStatus.OPEN,
          user_id: savedUsers[0].id, // Ten User
          contact_email: 'ten@example.com',
          contact_phone: '+1234567890',
        },
        {
          subject: 'Login issues with mobile app',
          description:
            'I am unable to login to the mobile app. It keeps showing invalid credentials error even though I am using the correct password.',
          priority: SupportTicketPriority.MEDIUM,
          category: SupportTicketCategory.TECHNICAL,
          status: SupportTicketStatus.IN_PROGRESS,
          user_id: savedUsers[1].id, // Mari User
          contact_email: 'mari@example.com',
          admin_response:
            'We are investigating this issue. Please try clearing the app cache and try again.',
          assigned_to: savedUsers[1].id, // Assigned to Mari (admin)
        },
        {
          subject: 'Billing inquiry about last order',
          description:
            'I was charged twice for my last order. Can you please check and refund the duplicate charge?',
          priority: SupportTicketPriority.HIGH,
          category: SupportTicketCategory.BILLING,
          status: SupportTicketStatus.RESOLVED,
          user_id: savedUsers[0].id, // Ten User
          contact_email: 'ten@example.com',
          admin_response:
            'We have identified the duplicate charge and processed a refund. It should appear in your account within 3-5 business days.',
          assigned_to: savedUsers[1].id, // Assigned to Mari (admin)
          resolved_at: new Date(),
        },
        {
          subject: 'Product quality complaint',
          description:
            'The fruits I received were not fresh and some were spoiled. This is disappointing as I expected better quality.',
          priority: SupportTicketPriority.URGENT,
          category: SupportTicketCategory.COMPLAINT,
          status: SupportTicketStatus.PENDING_CUSTOMER,
          user_id: savedUsers[0].id, // Ten User
          contact_email: 'ten@example.com',
          contact_phone: '+1234567890',
          admin_response:
            'We sincerely apologize for the poor quality. We have arranged for a replacement order and a partial refund. Please confirm your availability for delivery.',
          assigned_to: savedUsers[1].id, // Assigned to Mari (admin)
        },
        {
          subject: 'General inquiry about delivery times',
          description:
            'What are your standard delivery times for different areas in the city? I need to plan my schedule accordingly.',
          priority: SupportTicketPriority.LOW,
          category: SupportTicketCategory.GENERAL,
          status: SupportTicketStatus.CLOSED,
          user_id: savedUsers[1].id, // Mari User
          contact_email: 'mari@example.com',
          admin_response:
            'Our standard delivery times are 2-4 hours for city center and 4-6 hours for suburbs. Express delivery (1-2 hours) is available for an additional fee.',
          assigned_to: savedUsers[1].id, // Assigned to Mari (admin)
        },
      ];

      const savedSupportTickets =
        await this.customersSupportRepository.save(supportTickets);

      this.logger.log(
        `Users seeded successfully. Created ${savedUsers.length} users.`,
      );
      this.logger.log(
        `Locations seeded successfully. Created ${savedLocations.length} locations.`,
      );
      this.logger.log(
        `Products seeded successfully. Created ${savedProducts.length} products.`,
      );
      this.logger.log(
        `Payments seeded successfully. Created ${savedPayments.length} payments.`,
      );
      this.logger.log(
        `Orders seeded successfully. Created ${savedOrders.length} orders.`,
      );
      this.logger.log(
        `Feedbacks seeded successfully. Created ${savedFeedbacks.length} feedbacks.`,
      );
      this.logger.log(
        `Support tickets seeded successfully. Created ${savedSupportTickets.length} tickets.`,
      );
      this.logger.log('Database seeding completed successfully');

      return {
        success: true,
        message: `Successfully seeded ${savedUsers.length} users, ${savedLocations.length} locations, ${savedProducts.length} products, ${savedPayments.length} payments, ${savedOrders.length} orders, ${savedFeedbacks.length} feedbacks, and ${savedSupportTickets.length} support tickets`,
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
        payments: savedPayments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          payment_method: payment.payment_method,
          status: payment.status,
          user_id: payment.user_id,
        })),
        feedbacks: savedFeedbacks.map((feedback) => ({
          id: feedback.id,
          message: feedback.message,
          rating: feedback.rating,
          subject: feedback.subject,
          status: feedback.status,
          user_id: feedback.user_id,
        })),
        support_tickets: savedSupportTickets.map(
          (ticket: CustomersSupport) => ({
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            user_id: ticket.user_id,
          }),
        ),
      };
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  // Seed only payments (useful when users already exist)
  async seedPayments() {
    this.logger.log('Seeding payments only...');

    try {
      // Clear existing payments
      this.logger.log('Clearing existing payments from database...');
      await this.paymentRepository.clear();
      this.logger.log('Existing payments cleared successfully');

      // Get existing users to link payments to
      const existingUsers = await this.userRepository.find();

      if (existingUsers.length === 0) {
        throw new Error(
          'No users found. Please seed users first before seeding payments.',
        );
      }

      // Seed payments
      this.logger.log('Seeding payments...');
      const payments = [
        {
          amount: 250.0,
          payment_method: PaymentMethod.MPESA,
          status: PaymentStatus.COMPLETED,
          description: 'Payment for vegetables',
          user_id: existingUsers[0].id, // First user
        },
        {
          amount: 150.5,
          payment_method: PaymentMethod.CARD,
          status: PaymentStatus.PENDING,
          description: 'Payment for fruits',
          user_id: existingUsers[0].id, // First user
        },
        {
          amount: 500.0,
          payment_method: PaymentMethod.MPESA,
          status: PaymentStatus.COMPLETED,
          description: 'Bulk order payment',
          user_id:
            existingUsers.length > 1
              ? existingUsers[1].id
              : existingUsers[0].id, // Second user if exists, otherwise first
        },
        {
          amount: 75.25,
          payment_method: PaymentMethod.CASH,
          status: PaymentStatus.COMPLETED,
          description: 'Cash payment for groceries',
          user_id: existingUsers[0].id,
        },
        {
          amount: 320.0,
          payment_method: PaymentMethod.BANK_TRANSFER,
          status: PaymentStatus.FAILED,
          description: 'Failed bank transfer',
          user_id:
            existingUsers.length > 1
              ? existingUsers[1].id
              : existingUsers[0].id,
        },
      ];

      const savedPayments = await this.paymentRepository.save(payments);

      this.logger.log(
        `Payments seeded successfully. Created ${savedPayments.length} payments.`,
      );

      return {
        success: true,
        message: `Successfully seeded ${savedPayments.length} payments`,
        payments: savedPayments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          payment_method: payment.payment_method,
          status: payment.status,
          user_id: payment.user_id,
          transaction_id: payment.transaction_id,
          reference_number: payment.reference_number,
        })),
        // No orders are seeded in this method, so omit orders from the response or fetch them if needed.
      };
    } catch (error) {
      this.logger.error('Error seeding payments:', error);
      throw error;
    }
  }

  // Seed only orders (useful when users already exist)
  async seedOrders() {
    this.logger.log('Seeding orders only...');

    try {
      // Clear existing orders
      this.logger.log('Clearing existing orders from database...');
      await this.orderRepository.clear();
      this.logger.log('Existing orders cleared successfully');

      // Get existing users to link orders to
      const existingUsers = await this.userRepository.find();

      if (existingUsers.length === 0) {
        throw new Error(
          'No users found. Please seed users first before seeding orders.',
        );
      }

      // Seed orders
      this.logger.log('Seeding orders...');
      const orders = [
        {
          total_amount: 125.5,
          status: OrderStatus.CONFIRMED,
          priority: OrderPriority.NORMAL,
          shipping_address: '123 Main St, City, Country',
          billing_address: '123 Main St, City, Country',
          notes: 'Please deliver in the morning',
          user_id: existingUsers[0].id, // First user
        },
        {
          total_amount: 89.99,
          status: OrderStatus.PROCESSING,
          priority: OrderPriority.HIGH,
          shipping_address: '456 Elm St, City, Country',
          billing_address: '456 Elm St, City, Country',
          notes: 'Urgent delivery required',
          user_id:
            existingUsers.length > 1
              ? existingUsers[1].id
              : existingUsers[0].id, // Second user if exists
        },
        {
          total_amount: 200.0,
          status: OrderStatus.SHIPPED,
          priority: OrderPriority.NORMAL,
          shipping_address: '789 Oak Ave, City, Country',
          billing_address: '789 Oak Ave, City, Country',
          notes: 'Handle with care - fragile items',
          user_id: existingUsers[0].id,
          // shipped_at will be automatically set by @BeforeInsert hook
        },
        {
          total_amount: 45.75,
          status: OrderStatus.DELIVERED,
          priority: OrderPriority.LOW,
          shipping_address: '321 Pine St, City, Country',
          billing_address: '321 Pine St, City, Country',
          notes: 'Thank you for your order',
          user_id:
            existingUsers.length > 1
              ? existingUsers[1].id
              : existingUsers[0].id,
          // shipped_at and delivered_at will be automatically set by @BeforeInsert hook
        },
        {
          total_amount: 175.25,
          status: OrderStatus.PENDING,
          priority: OrderPriority.URGENT,
          shipping_address: '654 Maple Dr, City, Country',
          billing_address: '654 Maple Dr, City, Country',
          notes: 'Call before delivery',
          user_id: existingUsers[0].id,
        },
      ];

      // Save orders one by one to trigger @BeforeInsert hooks for order_number generation
      const savedOrders: Order[] = [];
      for (const orderData of orders) {
        const order = this.orderRepository.create(orderData);
        const savedOrder = await this.orderRepository.save(order);
        savedOrders.push(savedOrder);
        this.logger.debug(
          `Created order with ID: ${savedOrder.id}, Order Number: ${savedOrder.order_number}`,
        );
      }

      this.logger.log(
        `Orders seeded successfully. Created ${savedOrders.length} orders.`,
      );

      return {
        success: true,
        message: `Successfully seeded ${savedOrders.length} orders`,
        orders: savedOrders.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
          priority: order.priority,
          user_id: order.user_id,
          shipping_address: order.shipping_address,
        })),
      };
    } catch (error) {
      this.logger.error('Error seeding orders:', error);
      throw error;
    }
  }

  // Seed only feedbacks (useful when users already exist)
  async seedFeedbacks() {
    this.logger.log('Seeding feedbacks only...');

    try {
      // Clear existing feedbacks
      this.logger.log('Clearing existing feedbacks from database...');
      await this.feedbackRepository.clear();
      this.logger.log('Existing feedbacks cleared successfully');

      // Get existing users to link feedbacks to
      const existingUsers = await this.userRepository.find();
      if (existingUsers.length === 0) {
        return {
          success: false,
          message: 'No users found. Please seed users first.',
          error: 'No users available to link feedbacks to',
        };
      }

      this.logger.log(`Found ${existingUsers.length} existing users`);

      // Create feedback data
      const feedbacks = [
        {
          message:
            'Excellent service! Fast delivery and great product quality.',
          rating: FeedbackRating.FIVE,
          subject: 'Amazing Experience',
          status: FeedbackStatus.REVIEWED,
          user_id: existingUsers[0].id,
          admin_response:
            'Thank you for your positive feedback! We appreciate your business.',
        },
        {
          message: 'Good overall experience, but delivery could be faster.',
          rating: FeedbackRating.FOUR,
          subject: 'Good Service',
          status: FeedbackStatus.PENDING,
          user_id: existingUsers[Math.min(1, existingUsers.length - 1)].id,
        },
        {
          message: 'Average service. The product was okay but not exceptional.',
          rating: FeedbackRating.THREE,
          subject: 'Average Experience',
          status: FeedbackStatus.PENDING,
          user_id: existingUsers[0].id,
        },
        {
          message: 'Poor delivery experience. The package was damaged.',
          rating: FeedbackRating.TWO,
          subject: 'Delivery Issues',
          status: FeedbackStatus.RESOLVED,
          user_id: existingUsers[Math.min(1, existingUsers.length - 1)].id,
          admin_response:
            'We apologize for the delivery issues. We have improved our packaging process.',
        },
        {
          message: 'Outstanding customer support and product quality!',
          rating: FeedbackRating.FIVE,
          subject: 'Excellent Support',
          status: FeedbackStatus.REVIEWED,
          user_id: existingUsers[0].id,
          admin_response:
            'We are delighted to hear about your positive experience!',
        },
        {
          message: 'The website is easy to use and ordering was simple.',
          rating: FeedbackRating.FOUR,
          subject: 'User-Friendly Platform',
          status: FeedbackStatus.PENDING,
          user_id: existingUsers[Math.min(2, existingUsers.length - 1)].id,
        },
        {
          message: 'Very disappointed with the service. Will not order again.',
          rating: FeedbackRating.ONE,
          subject: 'Terrible Experience',
          status: FeedbackStatus.RESOLVED,
          user_id: existingUsers[Math.min(2, existingUsers.length - 1)].id,
          admin_response:
            'We sincerely apologize for your experience. We are working to improve our services.',
        },
      ];

      const savedFeedbacks = await this.feedbackRepository.save(feedbacks);

      this.logger.log(
        `Feedbacks seeded successfully. Created ${savedFeedbacks.length} feedbacks.`,
      );

      return {
        success: true,
        message: `Successfully seeded ${savedFeedbacks.length} feedbacks`,
        feedbacks: savedFeedbacks.map((feedback) => ({
          id: feedback.id,
          message: feedback.message,
          rating: feedback.rating,
          subject: feedback.subject,
          status: feedback.status,
          user_id: feedback.user_id,
          admin_response: feedback.admin_response,
        })),
      };
    } catch (error) {
      this.logger.error('Error seeding feedbacks:', error);
      throw error;
    }
  }

  // Seed only customer support tickets (useful when users already exist)
  async seedCustomersSupport() {
    this.logger.log('Seeding customer support tickets only...');

    try {
      // Clear existing customer support tickets
      this.logger.log(
        'Clearing existing customer support tickets from database...',
      );
      await this.customersSupportRepository.clear();
      this.logger.log('Existing customer support tickets cleared successfully');

      // Get existing users to link tickets to
      const existingUsers = await this.userRepository.find();
      if (existingUsers.length === 0) {
        throw new Error('No users found. Please seed users first.');
      }

      // Create customer support tickets
      const supportTickets = [
        {
          ticket_number: this.generateTicketNumber(), // Generate ticket number explicitly
          subject: 'Order delivery delay',
          description:
            'My order was supposed to be delivered yesterday but I have not received it yet. Could you please check the status?',
          priority: SupportTicketPriority.HIGH,
          category: SupportTicketCategory.ORDER_ISSUE,
          status: SupportTicketStatus.OPEN,
          user_id: existingUsers[0].id,
          contact_email: existingUsers[0].email,
          contact_phone: '+1234567890',
        },
        {
          ticket_number: this.generateTicketNumber(), // Generate ticket number explicitly
          subject: 'Login issues with mobile app',
          description:
            'I am unable to login to the mobile app. It keeps showing invalid credentials error even though I am using the correct password.',
          priority: SupportTicketPriority.MEDIUM,
          category: SupportTicketCategory.TECHNICAL,
          status: SupportTicketStatus.IN_PROGRESS,
          user_id: existingUsers[0].id,
          contact_email: existingUsers[0].email,
          admin_response:
            'We are investigating this issue. Please try clearing the app cache and try again.',
          assigned_to:
            existingUsers.find((u) => u.role === Role.ADMIN)?.id ||
            existingUsers[0].id,
        },
        {
          ticket_number: this.generateTicketNumber(), // Generate ticket number explicitly
          subject: 'Billing inquiry about last order',
          description:
            'I was charged twice for my last order. Can you please check and refund the duplicate charge?',
          priority: SupportTicketPriority.HIGH,
          category: SupportTicketCategory.BILLING,
          status: SupportTicketStatus.RESOLVED,
          user_id: existingUsers[0].id,
          contact_email: existingUsers[0].email,
          admin_response:
            'We have identified the duplicate charge and processed a refund. It should appear in your account within 3-5 business days.',
          assigned_to:
            existingUsers.find((u) => u.role === Role.ADMIN)?.id ||
            existingUsers[0].id,
          resolved_at: new Date(),
        },
        {
          ticket_number: this.generateTicketNumber(), // Generate ticket number explicitly
          subject: 'Product quality complaint',
          description:
            'The fruits I received were not fresh and some were spoiled. This is disappointing as I expected better quality.',
          priority: SupportTicketPriority.URGENT,
          category: SupportTicketCategory.COMPLAINT,
          status: SupportTicketStatus.PENDING_CUSTOMER,
          user_id: existingUsers[0].id,
          contact_email: existingUsers[0].email,
          contact_phone: '+1234567890',
          admin_response:
            'We sincerely apologize for the poor quality. We have arranged for a replacement order and a partial refund. Please confirm your availability for delivery.',
          assigned_to:
            existingUsers.find((u) => u.role === Role.ADMIN)?.id ||
            existingUsers[0].id,
        },
        {
          ticket_number: this.generateTicketNumber(), // Generate ticket number explicitly
          subject: 'General inquiry about delivery times',
          description:
            'What are your standard delivery times for different areas in the city? I need to plan my schedule accordingly.',
          priority: SupportTicketPriority.LOW,
          category: SupportTicketCategory.GENERAL,
          status: SupportTicketStatus.CLOSED,
          user_id: existingUsers[1] ? existingUsers[1].id : existingUsers[0].id,
          contact_email: existingUsers[1]
            ? existingUsers[1].email
            : existingUsers[0].email,
          admin_response:
            'Our standard delivery times are 2-4 hours for city center and 4-6 hours for suburbs. Express delivery (1-2 hours) is available for an additional fee.',
          assigned_to:
            existingUsers.find((u) => u.role === Role.ADMIN)?.id ||
            existingUsers[0].id,
        },
      ];

      const savedSupportTickets =
        await this.customersSupportRepository.save(supportTickets);

      this.logger.log(
        `Customer support tickets seeded successfully. Created ${savedSupportTickets.length} tickets.`,
      );

      return {
        success: true,
        message: `Successfully seeded ${savedSupportTickets.length} customer support tickets`,
        support_tickets: savedSupportTickets.map(
          (ticket: CustomersSupport) => ({
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            user_id: ticket.user_id,
          }),
        ),
      };
    } catch (error) {
      this.logger.error('Error seeding customer support tickets:', error);
      throw error;
    }
  }

  private generateTicketNumber(): string {
    // Generate a ticket number format: CS-YYYYMMDD-XXXX (e.g., CS-20250702-0001)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');

    return `CS-${year}${month}${day}-${randomNum}`;
  }

  // Seed users (utility method)
  async seedUsers() {
    this.logger.log('Seeding users...');
    const users = [
      {
        email: 'ten@gmail.com',
        fullName: 'Ten User',
        address: '123 Main St, City, Country',
        password: 'Password123',
        phoneNumber: '+254766558889',
        role: Role.USER,
      },
      {
        email: 'mari@example.com',
        fullName: 'Mari User',
        address: '456 Elm St, City, Country',
        password: 'Password123',
        phoneNumber: '+254756665443',
        role: Role.ADMIN,
      },
    ];

    const savedUsers = await this.userRepository.save(users);
    this.logger.log(
      `Users seeded successfully. Created ${savedUsers.length} users.`,
    );

    return {
      success: true,
      message: `Successfully seeded ${savedUsers.length} users`,
      users: savedUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      })),
    };
  }
}
