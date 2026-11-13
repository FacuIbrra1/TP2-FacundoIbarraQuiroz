import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacionDto } from './create-publicacion.dto.js';

// Editar una publicación (PATCH /publicaciones/:id): los mismos campos y reglas que al crearla,
// pero todos opcionales (se manda solo lo que cambia). Como UpdateAutorDto del ejercicio-1.
export class UpdatePublicacionDto extends PartialType(CreatePublicacionDto) {}
