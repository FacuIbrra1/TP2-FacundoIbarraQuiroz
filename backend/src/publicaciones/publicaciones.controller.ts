import {Body, Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service.js';
import { CreatePublicacionDto } from './dto/create-publicacion.dto.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// Sprint 2: alta, listado (orden, filtro y paginado), baja lógica y me gusta.
// @UseGuards en la clase: TODAS las rutas de publicaciones piden el token.
@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

 // multipart/form-data: título, mensaje y categoría en el body; la imagen (opcional) en "imagen".
  @Post()
  @UseInterceptors(FileInterceptor('imagen', {storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 }}))
  crear(@Body() createPublicacionDto: CreatePublicacionDto, @UploadedFile() imagen: Express.Multer.File | undefined, @Req() request: any) {
    // request.user lo cargó el AuthGuard: el autor es siempre el dueño del token.
    return this.publicacionesService.crear(createPublicacionDto, imagen, request.user.sub);
  }

  // GET /publicaciones?orden=likes&usuario=<id>&categoria=prueba&offset=0&limit=10
  // @Query() junta todos los parámetros de la URL y el ValidationPipe los valida con el DTO.
  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  // DELETE /publicaciones/:id → baja lógica (no se borra de la base: pasa a activa: false).
  // ParseObjectIdPipe (como en el ejercicio-1): si el id no tiene formato de id de Mongo, 400.
  @Delete(':id')
  borrar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: any) {
    // Del token salen quién es (sub) y su perfil: los dos deciden si puede borrarla.
    return this.publicacionesService.borrar(id, request.user.sub, request.user.perfil);
  }

  // POST /publicaciones/:id/like → el usuario del token le da me gusta.
  @Post(':id/like')
  darLike(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: any) {
    return this.publicacionesService.darLike(id, request.user.sub);
  }

  // DELETE /publicaciones/:id/like → le quita el me gusta (solo si lo había dado).
  @Delete(':id/like')
  quitarLike(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: any) {
    return this.publicacionesService.quitarLike(id, request.user.sub);
  }

  // GET /publicaciones/mis-likes -> los ids de las publicaciones a las que el usuario del token les dio me gusta.
  // Va antes de cualquier @Get(':id'): si no, Nest tomaría "mis-likes" como si fuera un id.
  @Get('mis-likes')
  misLikes(@Req() request: any) {
    return this.publicacionesService.misLikes(request.user.sub);
  }

}