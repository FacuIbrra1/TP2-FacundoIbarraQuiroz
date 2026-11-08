import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './entities/comentario.entity.js';
import { DATOS_AUTOR, PublicacionesService } from './publicaciones.service.js';

// Sprint 2: traer los comentarios de una publicación (Mi Perfil los muestra).
// Sprint 3: paginarlos, agregar nuevos y editarlos.
@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    // Otro servicio del mismo módulo, para reusar el control de "la publicación existe".
    private readonly publicacionesService: PublicacionesService,
  ) {}

  // ---- LISTAR ----
  async listar(publicacionId: Types.ObjectId) {
    // 404 si la publicación no existe o está dada de baja (el mismo control que borrar y los me gusta).
    await this.publicacionesService.buscarPublicacionActiva(publicacionId);

    return await this.comentarioModel
      .find({ publicacion: publicacionId })
      .sort('-fecha') // Los más recientes primero (lo pide el enunciado).
      .populate('autor', DATOS_AUTOR); // Quién comentó, con los mismos datos que el autor de una publicación.
  }
}