import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ComentariosService } from './comentarios.service.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';

// El "comentarios controller" que pide el enunciado, dentro del módulo publicaciones.
// Sin prefijo en @Controller(): el GET y el POST van en /publicaciones/:id/comentarios y el PUT (Sprint 3) en /comentarios/:id.
@Controller()
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /publicaciones/:id/comentarios → los comentarios de una publicación, los más recientes primero.
  @Get('publicaciones/:id/comentarios')
  listar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.comentariosService.listar(id);
  }
}