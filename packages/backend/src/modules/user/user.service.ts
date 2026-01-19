
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// Cập nhật user cho admin

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'isVerified', 'avatar'], // Ép kiểu lấy password ở đây
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { verificationToken: token },
      select: [
        'id',
        'email',
        'name',
        'verificationToken',
        'verificationTokenExpires',
        'isVerified',
      ],
    });
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetPasswordToken: token },
      select: [
        'id',
        'email',
        'name',
        'resetPasswordToken',
        'resetPasswordTokenExpires',
      ],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }


  // Lấy thông tin profile cho user đang đăng nhập
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'displayName', 'email', 'avatar', 'role', 'isVerified', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Cập nhật thông tin profile cho user đang đăng nhập
  async updateProfile(userId: string, updateProfileDto: { fullName: string; displayName?: string }): Promise<Partial<User>> {
    console.log('[UserService] updateProfile - Start. UserId:', userId, 'Dto:', updateProfileDto);

    // Find User
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.error('[UserService] updateProfile - User NOT FOUND for ID:', userId);
      throw new NotFoundException('User not found');
    }
    console.log('[UserService] updateProfile - User Found:', { id: user.id, email: user.email, name: user.name });

    // Update
    user.name = updateProfileDto.fullName;
    if (updateProfileDto.displayName) {
      user.displayName = updateProfileDto.displayName;
    }

    // Save
    const updatedUser = await this.userRepository.save(user);

    const { password, verificationToken, ...result } = updatedUser;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: { oldPassword: string; newPassword: string; confirmNewPassword: string }): Promise<{ message: string }> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác với mật khẩu cũ');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user || !user.password) {
      throw new BadRequestException('Người dùng không tồn tại hoặc chưa có mật khẩu');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return { message: 'Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<Partial<User>> {
    if (!file) {
      throw new BadRequestException('Không có tệp được tải lên');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ định dạng JPG, JPEG, PNG');
    }

    const maxFileSize = 2 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new BadRequestException('Kích thước tệp không được vượt quá 2MB');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    try {
      const cloudinaryFile = {
        ...file,
        buffer: file.buffer,
      };

      const uploadResult = await this.cloudinaryService.uploadFile(cloudinaryFile);

      user.avatar = uploadResult.secure_url;
      const updatedUser = await this.userRepository.save(user);

      const { password, verificationToken, ...result } = updatedUser;
      return result;
    } catch (error) {
      throw new BadRequestException(`Không thể tải lên avatar: ${error.message}`);
    }
  }
}