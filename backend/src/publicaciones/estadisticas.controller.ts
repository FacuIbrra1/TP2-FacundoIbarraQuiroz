import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';
import { AdminGuard } from '../guards/admin/admin.guard.js';

// Sprint 4: el "estadísticas controller" del módulo publicaciones.
// Todas por GET, una por gráfico, y solo para administradores:
// AuthGuard valida el token (401) y AdminGuard, que sea de un administrador (403).
// El lapso llega en la URL y lo valida el ValidationPipe con RangoFechasDto (400).
@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // GET /estadisticas/publicaciones-por-usuario?desde=2026-11-01&hasta=2026-11-30
  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(rango);
  }

  // GET /estadisticas/comentarios-por-dia?desde=...&hasta=...
  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(rango);
  }

  // GET /estadisticas/comentarios-por-publicacion?desde=...&hasta=...
  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(rango);
  }
}
