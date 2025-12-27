import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('⚠️ Cloudinary credentials are missing! Image upload will fail.');
    } else {
      console.log(`✅ Cloudinary configured with Cloud Name: ${cloudName}`);
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  uploadFile(file: Express.Multer.File): Promise<any> {
    // Check config before attempting upload
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return Promise.reject(new Error('MISSING_CLOUDINARY_CREDENTIALS: Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to Vercel Environment Variables.'));
    }

    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new Error('FILE_BUFFER_MISSING: The uploaded file has no content.'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'restaurant-menu-items',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new Error(`CLOUDINARY_ERROR: ${error.message || error}`));
          }
          resolve(result);
        },
      );

      // Convert buffer to stream manually to avoid 'streamifier' dependency issues
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      
      stream.pipe(uploadStream);
    });
  }
}
