import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowHeaders: 'Content-Type,Accept Authorization',
    credentials: true,
  });
  // enable global validation pipes
  app.useGlobalPipes(new ValidationPipe());
  // api versioning
  app.setGlobalPrefix('api/v1');

  // await app.listen(process.env.PORT ?? 3000);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 3000;
  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
