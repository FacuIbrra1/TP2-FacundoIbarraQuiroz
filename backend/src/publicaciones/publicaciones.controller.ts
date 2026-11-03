import { Controller } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';

// Sprint 2: alta, listado (orden, filtro y paginado), baja lógica y me gusta.
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}
}
