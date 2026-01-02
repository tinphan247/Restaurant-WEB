import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // 1. Test thử băm trực tiếp tại chỗ
  const testHash = await bcrypt.hash('password123', 10);
  console.log('Test Hash mới tạo:', testHash);
  
  // 2. So sánh pass nhập vào với chính cái hash vừa tạo
  const testMatch = await bcrypt.compare('password123', testHash);
  console.log('Test so sánh nội bộ:', testMatch);
  const user = await this.userService.findOneByEmail(email);

  // LOG để kiểm tra giá trị thực tế truyền vào
  console.log('Pass nhập vào:', pass); 
  console.log('Hash từ DB:', user?.password);

  if (user && user.password) {
    // Thứ tự: pass (plain text) trước, user.password (hash) sau
    const isMatch = await bcrypt.compare(pass, user.password);
    console.log('Kết quả so sánh:', isMatch);

    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
  }
  return null;
}

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async googleLogin(req) {
    if (!req.user) throw new UnauthorizedException();
    return this.login(req.user);
  }
}