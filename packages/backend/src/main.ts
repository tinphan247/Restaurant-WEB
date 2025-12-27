import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Cần thiết cho DTO validation
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  // Enable CORS for frontend
  app.enableCors({
    origin: true, // Allow all origins temporarily
    credentials: true,
  });

  // Serve static files from uploads folder
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Thêm tiền tố API (giúp frontend dễ dàng proxy)
  app.setGlobalPrefix('api');

  // Kích hoạt ValidationPipe toàn cục
  // Điều này đảm bảo mọi DTO (CreateTableDtoValidator,...) đều được kiểm tra trước khi vào Controller
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có trường không được định nghĩa
      transform: true, // Tự động chuyển đổi kiểu dữ liệu (ví dụ: string '1' -> number 1)
    }),
  );

  // Lấy cổng từ biến môi trường (mặc định là 3000)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();