import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Las tres claves salen del panel de Cloudinary y van en el .env.
    // Se configura acá y no arriba del archivo (como en el ejemplo de clase): este archivo
    // se carga antes que el .env, y las claves llegarían vacías.
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Igual que el ejemplo de clase: upload_stream recibe la imagen que FileInterceptor dejó en
  // memoria (imagen.buffer) y avisa el resultado en un callback. La Promise permite esperarlo
  // con await y devuelve la URL pública, que es la que se guarda en la base.
  subirImagen(imagen: Express.Multer.File, carpeta: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          resource_type: 'image',
          // Sin public_id: Cloudinary le pone un nombre único. Con el nombre del archivo (como
          // en el ejemplo), dos usuarios que suban "foto.jpg" se pisarían la imagen.
        },
        (error, result) => {
          if (error) {
            reject(new Error('No se pudo subir la imagen a Cloudinary'));
          } else if (!result?.secure_url) {
            reject(new Error('Cloudinary no devolvió la URL de la imagen'));
          } else {
            resolve(result.secure_url);
          }
        },
      );
      stream.on('error', () => {
        reject(new Error('No se pudo enviar la imagen a Cloudinary'));
      });
      stream.end(imagen.buffer);
    });
  }
}
