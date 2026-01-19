import { Controller, Get, Put, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';


@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id || req.user.sub;
    return await this.userService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() body) {

    const userId = req.user.id || req.user.sub;
    return await this.userService.updateProfile(userId, body);
  }

  @Post('change-password')
  async changePassword(@Request() req, @Body() body) {
    const userId = req.user.id || req.user.sub;
    return await this.userService.changePassword(userId, body);
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên một tệp hình ảnh');
    }
    const userId = req.user.id || req.user.sub;
    const updatedProfile = await this.userService.uploadAvatar(userId, file);
    return {
      statusCode: 200,
      message: 'Tải lên avatar thành công',
      data: {
        avatar: updatedProfile.avatar,
      },
    };
  }
}
