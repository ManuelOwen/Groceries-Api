import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable Helmet for security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
          fontSrc: ["'self'", 'cdnjs.cloudflare.com'],
          imgSrc: ["'self'", 'data:', '*.postgresql.org', 'nestjs.com'],
        },
      },
    }),
  );
  // Enable CORS
// Enable CORS
app.enableCors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:8000',
    'http://localhost:3000',  // Add your frontend URL
    'http://localhost:5173'   
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowHeaders: 'Content-Type,Accept,Authorization',
  credentials: true,  });
  // enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // Allow implicit type conversion
    },
  }));
  
  // Use global exception filter to handle all errors gracefully
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // api versioning
  app.setGlobalPrefix('api/v1');
  // swagger documentation
  const config = new DocumentBuilder()
  .setTitle('Olive Groceries API')
  .setDescription(`Olive Groceries API documentation is an Api  basically shows the events that happens as the user books and pay for the goroceries after ordering. Also the user is able to track their orders and payments seamlessly.
    This API is designed to provide a comprehensive solution for managing grocery orders, payments, and user interactions. 
    It includes features such as user authentication, order management, payment processing, and customer support.
   ##Resources
    The resources include:
    - **Users**: Manage user accounts, authentication, and roles.
    - **Products**: Manage grocery products, including categories and details.
    - **Orders**: Handle order creation, updates, and tracking.
    - **Payments**: Process payments for orders, including payment methods and statuses.
    - **Feedbacks**: Collect and manage user feedback on products and services.
    - **Customers Support**: Provide support for users through tickets and responses.
    - **Location**: Manage delivery locations and addresses.
    - **Seed**: Populate the database with initial data for testing and development.
      The API is built using NestJS, a progressive Node.js framework, and uses TypeORM for database interactions with PostgreSQL.
      The API is designed to be secure, scalable, and easy to use, with comprehensive documentation and examples for developers.
      `)
      .setVersion('1.0')
      // .addTag('users, authentication and user management')
      // .addTag('products, product management and categories')
      // .addTag('orders, order management')
      // .addTag('payments, payment processing')
      // .addTag('feedbacks, user feedback management')
      // .addTag('customers-support, user support')
      // .addTag('location, delivery location management')
  // .addTag('seed, database seeding')
  .addBearerAuth()
  .addServer('http://localhost:8000', 'Local Development Server')
  .build();
  const document = SwaggerModule.createDocument(app, config, {
    include:[
      require('./users/users.module').UsersModule,
      require('./auth/auth.module').AuthModule,
      require('./products/products.module').ProductsModule,
      require('./orders/orders.module').OrdersModule,
      require('./payments/payments.module').PaymentsModule,
      require('./feedbacks/feedbacks.module').FeedbacksModule,
      require('./customers-support/customers-support.module').CustomersSupportModule,
      require('./location/location.module').LocationModule,
         ]
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization:true,
      operationsSorter: 'alpha',
      showRequestDuration:true,
      tryItOutEnabled: true,
      filter: true,
      showTags: true,
    },
      customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 20px; }
    `,
      customSiteTitle: 'Olive Groceries API Documentation',
      // customfavIcon: 'https://example.com/favicon.ico', // Replace with your favicon URL

  });

  // await app.listen(process.env.PORT ?? 8000);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 8000;
  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
function addServer(arg0: string, arg1: string) {
  throw new Error('Function not implemented.');
}

