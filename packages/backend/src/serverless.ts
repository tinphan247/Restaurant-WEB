import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    try {
      const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Enable full logging
      });

      // Enable CORS for Vercel Frontend
      app.enableCors({
        origin: true, // Allow all origins temporarily to fix CORS issues
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });

      // Serve static files (Vercel /tmp for uploads)
      // Note: Files in /tmp are ephemeral and will be deleted! Use S3/Cloudinary for production.
      if (process.env.VERCEL) {
        app.useStaticAssets('/tmp', {
          prefix: '/uploads/menu-items/',
        });
      } else {
        app.useStaticAssets(join(__dirname, '..', 'uploads'), {
          prefix: '/uploads/',
        });
      }

      app.setGlobalPrefix('api');

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();
      cachedServer = app.getHttpAdapter().getInstance();
    } catch (error) {
      console.error('NestJS Bootstrap Error:', error);
      throw error;
    }
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('Serverless Handler Error:', error);
    // Trả về lỗi chi tiết ra trình duyệt để debug (chỉ dùng khi debug)
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
