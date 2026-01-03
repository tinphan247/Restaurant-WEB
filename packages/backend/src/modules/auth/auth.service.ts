import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userService.findOneByEmail(data.email);
    if (existingUser) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create({ ...data, password: hashedPassword });

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(data: { email: string; password: string }) {
    // Tìm user và đảm bảo lấy cả trường password nếu entity đang để select: false
  const user = await this.userService.findOneByEmail(data.email);

  // Kiểm tra user tồn tại và mật khẩu không bị undefined
  if (!user || !user.password) {
    throw new UnauthorizedException('Sai email hoặc mật khẩu');
  }

  // So sánh mật khẩu
  const isMatch = await bcrypt.compare(data.password, user.password);
  
  if (!isMatch) {
    throw new UnauthorizedException('Sai email hoặc mật khẩu');
  }

  // Xóa password khỏi object trước khi tạo token/trả về client
  const { password, ...result } = user;

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}