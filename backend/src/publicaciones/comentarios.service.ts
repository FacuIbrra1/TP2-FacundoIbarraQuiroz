import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './entities/comentario.entity.js';
import { DATOS_AUTOR, PublicacionesService } from './publicaciones.service.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { CreateComentarioDto } from './dto/create-comentario.dto.js';

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
  async listar(publicacionId: Types.ObjectId, paginado: ListarComentariosDto) {
    // Igual que en el listado de publicaciones: si no vienen, desde el primero y de a 10.
    const offset = Number(paginado.offset ?? 0);
    const limit = Number(paginado.limit ?? 10);
    if (limit < 1 || limit > 50) {
      throw new BadRequestException('El limit tiene que estar entre 1 y 50');
    }

    // 404 si la publicación no existe o está dada de baja (el mismo control que borrar y los me gusta).
    await this.publicacionesService.buscarPublicacionActiva(publicacionId);

    return await this.comentarioModel
      .find({ publicacion: publicacionId })
      .sort('-fecha') // Los más recientes primero (lo pide el enunciado).
      .skip(offset) // Se saltea los de las páginas anteriores.
      .limit(limit) // Trae como máximo "limit".
      .populate('autor', DATOS_AUTOR); // Quién comentó, con los mismos datos que el autor de una publicación.
  }


  // ---- COMENTAR ----
  async crear(publicacionId: Types.ObjectId, createComentarioDto: CreateComentarioDto, autorId: string) {
    // 404 si la publicación no existe o está dada de baja.
    await this.publicacionesService.buscarPublicacionActiva(publicacionId);

    // La fecha no se manda: la pone el schema (default: Date.now). "modificado" arranca en false.
    const nuevoComentario = await this.comentarioModel.create({
      publicacion: publicacionId,
      autor: autorId,
      mensaje: createComentarioDto.mensaje,
    });

    // Se devuelve con los datos del autor, igual que en el listado.
    return await this.comentarioModel.findById(nuevoComentario._id).populate('autor', DATOS_AUTOR);
  }


  // ---- EDITAR ----
  async editar(id: Types.ObjectId, createComentarioDto: CreateComentarioDto, usuarioId: string) {
    // 404: el comentario no existe.
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    // 404: si la publicación se dio de baja, sus comentarios tampoco se pueden editar.
    await this.publicacionesService.buscarPublicacionActiva(comentario.publicacion);

    // 403: solo lo puede editar quien lo escribió. Se comparan como texto, igual que al borrar una publicación.
    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('Solo podés editar tus comentarios');
    }

    // Cambia el mensaje y queda marcado como modificado (el front muestra "(editado)").
    comentario.mensaje = createComentarioDto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return await this.comentarioModel.findById(id).populate('autor', DATOS_AUTOR);
  }
}