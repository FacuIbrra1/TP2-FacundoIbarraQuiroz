import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Las tres claves salen del panel de Cloudinary y van en el .env.
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Sube la imagen a la carpeta indicada y devuelve su URL pública (la que se guarda en la base).
  async subirImagen(imagen: Express.Multer.File, carpeta: string) {
    // FileInterceptor deja la imagen en memoria (imagen.buffer).
    // Cloudinary la acepta como texto: "data:<tipo>;base64,<contenido>".
    const archivo = `data:${imagen.mimetype};base64,${imagen.buffer.toString('base64')}`;

    const resultado = await cloudinary.uploader.upload(archivo, {
      folder: carpeta,
    });
    return resultado.secure_url;
  }
}
