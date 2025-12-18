import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class QrUtils {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(tableId: string, tableNumber: string): string {
    const payload = { sub: tableId, tableNumber };
    // Token có hạn 1 ngày (hoặc tùy chỉnh)
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}