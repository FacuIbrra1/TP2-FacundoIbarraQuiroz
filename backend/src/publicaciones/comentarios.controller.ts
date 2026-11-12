import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ComentariosService } from './comentarios.service.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { CreateComentarioDto } from './dto/create-comentario.dto.js';

// El "comentarios controller" que pide el enunciado, dentro del módulo publicaciones.
// Sin prefijo en @Controller(): el GET y el POST van en /publicaciones/:id/comentarios y el PUT en /comentarios/:id.
@Controller()
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /publicaciones/:id/comentarios?offset=0&limit=5 → los comentarios de una publicación,
  // los más recientes primero y paginados (como el listado de publicaciones).
  @Get('publicaciones/:id/comentarios')
  listar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Query() paginado: ListarComentariosDto) {
    return this.comentariosService.listar(id, paginado);
  }

  // POST /publicaciones/:id/comentarios → comenta la publicación. El autor sale del token y la fecha la pone el schema.
  @Post('publicaciones/:id/comentarios')
  crear(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() createComentarioDto: CreateComentarioDto, @Req() request: any) {
    return this.comentariosService.crear(id, createComentarioDto, request.user.sub);
  }

  // PUT /comentarios/:id → cambia el mensaje (solo quien lo escribió) y lo marca como modificado.
  @Put('comentarios/:id')
  editar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() createComentarioDto: CreateComentarioDto, @Req() request: any) {
    return this.comentariosService.editar(id, createComentarioDto, request.user.sub);
  }
}
