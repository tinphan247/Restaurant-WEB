
import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './user.entity';
import { UserService } from './user.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    require('../../common/cloudinary/cloudinary.module').CloudinaryModule,
  ], // Dùng forwardRef để tránh circular dependency
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export để AuthModule có thể sử dụng UserService
})
export class UserModule { }