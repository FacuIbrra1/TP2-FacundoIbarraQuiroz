import { IsString, Matches, MaxLength } from 'class-validator';

// El mensaje de un comentario. Lo usan el POST (comentar) y el PUT (editar): los dos piden lo mismo.
// No tiene autor ni publicacion: el autor sale del token y la publicación, de la URL.
// Si alguien los manda, forbidNonWhitelisted responde 400.
export class CreateComentarioDto {
  @IsString({ message: 'El comentario tiene que ser un texto' })
  // \S = cualquier carácter que no sea un espacio. Rechaza "" y también "   ", que el schema
  // dejaría vacío al recortarlo (trim) y terminaría en un 500 en lugar de un 400.
  @Matches(/\S/, { message: 'El comentario es obligatorio' })
  @MaxLength(500, { message: 'El comentario no puede superar los 500 caracteres' })
  mensaje: string;
}