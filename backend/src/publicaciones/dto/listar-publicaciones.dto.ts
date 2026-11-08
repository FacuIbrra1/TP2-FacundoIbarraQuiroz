import { IsIn, IsMongoId, IsNumberString, IsOptional } from 'class-validator';

// Los filtros del listado (GET /publicaciones), todos opcionales:
//   /publicaciones?orden=likes&usuario=<id>&categoria=prueba&offset=0&limit=10
// Llegan como texto porque son parte de la URL.
// Un parámetro que no esté acá (por ejemplo, "ordem") lo rechaza forbidNonWhitelisted con un 400.

export class ListarPublicacionesDto {
  // Si no viene, se ordena por fecha.
  @IsOptional()
  @IsIn(['fecha', 'likes'], { message: 'El orden debe ser fecha o likes' })
  orden?: string;

  // Para ver solo las publicaciones de un usuario (Mi Perfil).
  @IsOptional()
  @IsMongoId({ message: 'El usuario no es un id válido' })
  usuario?: string;

  @IsOptional()
  @IsIn(['general', 'busco-club', 'busco-jugadores', 'prueba'], {message:'La categoría debe ser general, busco-club, busco-jugadores o prueba'})
  categoria?: string;

  // no_symbols: solo dígitos (rechaza "-1", "1.5" y "abc").
  @IsOptional()
  @IsNumberString({ no_symbols: true },{ message: 'El offset tiene que ser un número entero, 0 o mayor' })
  offset?: string;

  @IsOptional()
  @IsNumberString({ no_symbols: true }, { message: 'El limit tiene que ser un número entero' })
  limit?: string;
}