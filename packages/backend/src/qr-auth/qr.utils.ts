import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class QrUtils {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(tableId: string, tableNumber: number): string {
    // Payload bao gồm: tableId, restaurantId (for multi-tenant), tableNumber
    // JWT tự động thêm 'iat' (issued at timestamp)
    const payload = { 
      sub: tableId, 
      tableNumber,
      restaurantId: process.env.RESTAURANT_ID || 'default' // Default for single-tenant
    };
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