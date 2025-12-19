import { Controller, Post, Param, Get, Query, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrVerifyGuard } from './guards/qr-verify.guard';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  // API cho Admin: Tạo mới QR cho bàn
  @Post('generate/:tableId')
  async generate(@Param('tableId') tableId: string) {
    return this.qrService.generateQrCode(tableId);
  }

  // API cho Admin: Tạo lại (regenerate) QR cho bàn - invalidate token cũ
  @Post('regenerate/:tableId')
  async regenerate(@Param('tableId') tableId: string) {
    return this.qrService.generateQrCode(tableId);
  }

  // API cho Admin: Regenerate tất cả QR codes (requirement 4.3)
  @Post('regenerate-all')
  async regenerateAll() {
    return this.qrService.regenerateAllQrCodes();
  }

  // API cho Khách hàng: Verify token khi quét mã
  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }
    const result = await this.qrService.verifyQrAccess(token);
    if (!result.valid) {
      throw new UnauthorizedException(result.message);
    }
    return result;
  }

  // API mẫu: Endpoint được bảo vệ bởi QrVerifyGuard (sử dụng cho các API cần xác thực QR)
  @Get('protected-menu')
  @UseGuards(QrVerifyGuard)
  async getProtectedMenu(@Req() req: any) {
    // tableInfo được gắn vào request bởi QrVerifyGuard
    return {
      message: 'Truy cập menu thành công!',
      tableId: req.tableInfo.tableId,
      tableNumber: req.tableInfo.tableNumber,
    };
  }
}