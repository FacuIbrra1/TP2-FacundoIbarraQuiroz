import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service.js';
import { PublicacionesController } from './publicaciones.controller.js';
import {Publicacion, PublicacionSchema} from './entities/publicacion.entity.js';
import { Like, LikeSchema } from './entities/like.entity.js';
import { Comentario, ComentarioSchema } from './entities/comentario.entity.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { EstadisticasService } from './estadisticas.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    CloudinaryModule, // Para subir la imagen opcional de cada publicación.
  ],
  // Sprint 4: el EstadisticasController va en este módulo (lo pide el enunciado), porque usa
  // los modelos de publicaciones y comentarios que ya están registrados acá.
  controllers: [PublicacionesController, ComentariosController, EstadisticasController],
  providers: [PublicacionesService, ComentariosService, EstadisticasService]
})

export class PublicacionesModule {}