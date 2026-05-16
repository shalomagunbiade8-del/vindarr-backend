import './config/cloudinary';

import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';

import { join } from 'path';

import { NestExpressApplication } from '@nestjs/platform-express';

import * as express from 'express';

async function bootstrap() {

  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  // =====================================
  // CORS
  // =====================================

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // =====================================
  // STATIC FILES
  // =====================================

  app.use(
    '/uploads',
    express.static(
      join(__dirname, '..', 'uploads'),
    ),
  );

  // =====================================
  // GLOBAL INTERCEPTORS
  // =====================================

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(
      app.get(Reflector),
    ),
  );

  // =====================================
  // VALIDATION
  // =====================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // =====================================
  // START SERVER
  // =====================================

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  console.log(
    `✅ Server running on port ${PORT}`,
  );
}

bootstrap();