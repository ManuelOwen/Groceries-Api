import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const multerCloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params() {
    return {
      folder: 'products', // Cloudinary folder
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    };
  },
});
