import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService], // Lo usan el registro (foto de perfil) y, en el Sprint 2, las publicaciones.
})
export class CloudinaryModule {}
