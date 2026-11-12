import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { CreatePublicacionDto } from './dto/create-publicacion.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { Like } from './entities/like.entity.js';

// Los datos del autor que se muestran con cada publicación (nunca la contraseña ni el correo).
export const DATOS_AUTOR = 'nombre apellido username imagenUrl tipo';

// Sprint 2: acá va la lógica de las publicaciones.
@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Like.name)
    private readonly likeModel: Model<Like>,
  ) {}

  // ---- CREAR ----
  async crear(
    createPublicacionDto: CreatePublicacionDto,
    imagen: Express.Multer.File | undefined,
    autorId: Types.ObjectId) {

    // La imagen es opcional. Si viene, tiene que ser una imagen y se sube a Cloudinary.
    let imagenUrl = '';
    if (imagen) {
      if (!imagen.mimetype.startsWith('image/')) {
        throw new BadRequestException('El archivo tiene que ser una imagen');
      }

      imagenUrl = await this.cloudinaryService.subirImagen(imagen,'potrero-libre/publicaciones',);
    }

    const nuevaPublicacion = await this.publicacionModel.create({
      titulo: createPublicacionDto.titulo,
      mensaje: createPublicacionDto.mensaje,
      categoria: createPublicacionDto.categoria, // Si no vino, Mongoose pone 'general'.
      imagenUrl: imagenUrl,
      autor: autorId,
    });

    // Se devuelve con los datos del autor, igual que la va a mostrar el listado.
    return await this.publicacionModel.findById(nuevaPublicacion._id).populate('autor', DATOS_AUTOR)}


    
  // ---- LISTAR ----
  async listar(filtros: ListarPublicacionesDto) {
    // Los números llegan como texto en la URL. Si no vienen: desde la primera, de a 10.
    const offset = Number(filtros.offset ?? 0);
    const limit = Number(filtros.limit ?? 10);
    if (limit < 1 || limit > 50) {
      throw new BadRequestException('El limit tiene que estar entre 1 y 50');
    }

    // Qué publicaciones traer: nunca las dadas de baja, y los filtros que hayan llegado.
    const condiciones: any = { activa: true };
    if (filtros.usuario) {
      condiciones.autor = filtros.usuario;
    }
    if (filtros.categoria) {
      condiciones.categoria = filtros.categoria;
    }

    // Mismo formato que .select('-password'): campos separados por espacio.
    // En sort, el "-" significa de mayor a menor.
    // Por me gusta: las de más me gusta primero y, si empatan, la más nueva.
    const orden =
      filtros.orden === 'likes' ? '-cantidadLikes -fecha' : '-fecha';

    return await this.publicacionModel
      .find(condiciones)
      .sort(orden) // Ordena.
      .skip(offset) // Se saltea las primeras "offset" (las de las páginas anteriores).
      .limit(limit) // Trae como máximo "limit".
      .populate('autor', DATOS_AUTOR);
  }


  // ---- BORRAR (baja lógica) ----
  async borrar(id: Types.ObjectId, usuarioId: string, perfil: string) {
    const publicacion = await this.buscarPublicacionActiva(id);

    // 403: solo la puede borrar quien la publicó o un administrador.
    // autor es un ObjectId y usuarioId es texto (viene del token): se comparan como texto.
    const esAutor = publicacion.autor.toString() === usuarioId;
    const esAdministrador = perfil === 'administrador';
    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException('Solo podés borrar tus publicaciones');
    }

    // Baja lógica: queda en la base, pero el listado ya no la muestra.
    publicacion.activa = false;
    await publicacion.save();

    return { message: 'Publicación eliminada' };
  }


  // ---- DAR ME GUSTA ----
  async darLike(id: Types.ObjectId, usuarioId: string) {
    await this.buscarPublicacionActiva(id);

    // 409: un solo me gusta por usuario. Se revisa antes de crear, como el correo repetido del registro.
    const likeExistente = await this.likeModel.findOne({ publicacion: id, usuario: usuarioId });
    if (likeExistente) {
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }

    await this.likeModel.create({ publicacion: id, usuario: usuarioId });

    // $inc suma 1 directo en la base: no hace falta leer el número, sumarlo y guardarlo.
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      id,
      { $inc: { cantidadLikes: 1 } },
      { returnDocument: 'after' }, // Devuelve la publicación ya actualizada (como en el ejercicio-1).
    );

    return { message: 'Me gusta agregado', cantidadLikes: publicacion?.cantidadLikes };
  }


  // ---- QUITAR ME GUSTA ----
  async quitarLike(id: Types.ObjectId, usuarioId: string) {
    await this.buscarPublicacionActiva(id);

    // 404: solo se puede quitar un me gusta que el usuario había dado.
    const like = await this.likeModel.findOne({ publicacion: id, usuario: usuarioId });
    if (!like) {
      throw new NotFoundException('No le habías dado me gusta a esta publicación');
    }

    await this.likeModel.findByIdAndDelete(like._id);

    // $inc con -1: resta uno.
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      id,
      { $inc: { cantidadLikes: -1 } },
      { returnDocument: 'after' },
    );

    return { message: 'Me gusta quitado', cantidadLikes: publicacion?.cantidadLikes };
  }


  // Borrar, dar y quitar me gusta empiezan igual: la publicación tiene que existir y estar activa.
  // 404: no existe, o ya estaba dada de baja (para el usuario es lo mismo: no está).
  // Sin private: también lo usa ComentariosService.
  async buscarPublicacionActiva(id: Types.ObjectId) {
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('La publicación no existe');
    }
    return publicacion;
  }

  
  // ---- BUSCAR POR ID ----
  // Para la página de una publicación: 404 si no está (el mismo control que borrar y los me gusta)
  // y, si está, se trae con los datos del autor, igual que en el listado.
  async buscarPorId(id: Types.ObjectId) {
    await this.buscarPublicacionActiva(id);
    return await this.publicacionModel.findById(id).populate('autor', DATOS_AUTOR);
  }


  // ---- MIS ME GUSTA ----
  // El front lo usa para saber en qué publicaciones mostrar el me gusta ya dado.
  async misLikes(usuarioId: string) {
    // Solo el campo publicacion, como el .select('-password') pero al revés: se elige qué traer.
    const likes = await this.likeModel.find({ usuario: usuarioId }).select('publicacion');

    // De [{ _id, publicacion }, ...] a una lista de ids: ['...', '...'].
    return likes.map((like) => like.publicacion);
  }
    
}