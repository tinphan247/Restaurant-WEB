import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký Entity User với TypeORM
  providers: [UserService],
  exports: [UserService], // Export để AuthModule có thể sử dụng UserService
})
export class UserModule {}