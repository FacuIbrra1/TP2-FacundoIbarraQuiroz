import {IsIn, IsNotEmpty, IsOptional, IsString, MaxLength} from 'class-validator';

// Los datos de una publicación nueva (POST /publicaciones).
// Llega como multipart/form-data (por la imagen opcional): todos los campos llegan como texto.
//
// No tiene `autor`: sale del token. Si alguien lo manda para publicar a nombre de otro,
// forbidNonWhitelisted lo rechaza con un 400.
// Tampoco tiene `imagenUrl`: la arma el back al subir la imagen a Cloudinary.
export class CreatePublicacionDto {
  @IsString({ message: 'El título tiene que ser un texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  titulo: string;

  @IsString({ message: 'El mensaje tiene que ser un texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(1000, {message: 'El mensaje no puede superar los 1000 caracteres',})
  mensaje: string;

  // Opcional: si no viene, el schema la guarda como 'general'.
  @IsOptional()
  @IsIn(['general', 'busco-club', 'busco-jugadores', 'prueba'], {message: 'La categoría debe ser general, busco-club, busco-jugadores o prueba',})
  categoria?: string;
}