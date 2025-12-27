import { Controller, Post, Param, UploadedFiles, UseInterceptors, Get, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { MenuItemPhotosService } from './menu-item-photos.service'; 

@Controller('admin/menu/items/:itemId/photos')
export class MenuItemPhotosController {
  
  constructor(
    private readonly photosService: MenuItemPhotosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async findAll(@Param('itemId') itemId: string) {
    return this.photosService.findAllByItem(itemId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: memoryStorage(), // Use memory storage to get file buffer
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async uploadPhotos(@Param('itemId') itemId: string, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      const photos = await Promise.all(
        files.map(async (file) => {
          // Upload to Cloudinary
          const result = await this.cloudinaryService.uploadFile(file);
          
          // Save to DB with Cloudinary URL
          return this.photosService.create({
            menuItemId: itemId,
            url: result.secure_url, // Use the secure URL from Cloudinary
            isPrimary: false
          });
        })
      );
      
      return { itemId, uploadedCount: files.length, photos };
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(`Upload failed: ${error.message || error}`);
    }
  }
  
  // Xóa ảnh theo id
  @Delete(':photoId')
  async removePhoto(@Param('photoId') photoId: string) {
    await this.photosService.remove(photoId);
    return { success: true };
  }
}