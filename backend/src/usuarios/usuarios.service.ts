import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario } from './entities/usuario.entity.js';
import { Ingreso } from './entities/ingreso.entity.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    @InjectModel(Ingreso.name) private readonly ingresoModel: Model<Ingreso>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Trae la contraseña: el login la necesita para compararla.
  async buscarPorEmail(email: string) {
    return await this.usuarioModel.findOne({ email: email });
  }

  async buscarPorUsername(username: string) {
    return await this.usuarioModel.findOne({ username: username });
  }

  // Sin la contraseña: es lo que se le devuelve al front.
  async buscarPorId(id: Types.ObjectId) {
    return await this.usuarioModel.findById(id).select('-password');
  }

  async crear(
    createUsuarioDto: CreateUsuarioDto,
    passwordEncriptada: string,
    imagenUrl: string,
  ) {
    // Campo por campo: a la base llega solo lo que se elige acá.
    return await this.usuarioModel.create({
      nombre: createUsuarioDto.nombre,
      apellido: createUsuarioDto.apellido,
      email: createUsuarioDto.email,
      username: createUsuarioDto.username,
      password: passwordEncriptada,
      fechaNacimiento: createUsuarioDto.fechaNacimiento, // Mongoose convierte el texto a Date.
      descripcion: createUsuarioDto.descripcion,
      imagenUrl: imagenUrl,
      tipo: createUsuarioDto.tipo,
    });
  }

  // Sprint 3: anota que el usuario entró (la fecha la pone el schema). La usan el login y el registro.
  async registrarIngreso(usuarioId: Types.ObjectId) {
    await this.ingresoModel.create({ usuario: usuarioId });
  }


  // ---- EDITAR MI PERFIL (corrección del Sprint 3) ----
  async editarPerfil(id: Types.ObjectId, updatePerfilDto: UpdatePerfilDto, imagen: Express.Multer.File | undefined) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new UnauthorizedException('El usuario del token ya no existe');
    }

    // El apellido depende del tipo de cuenta, igual que en el registro: un club no tiene,
    // y para jugador y DT no puede quedar vacío.
    if (updatePerfilDto.apellido !== undefined) {
      if (usuario.tipo === 'club') {
        updatePerfilDto.apellido = '';
      } else if (!updatePerfilDto.apellido.trim()) {
        throw new BadRequestException('El apellido es obligatorio');
      }
    }

    // La foto nueva es opcional. Se valida antes de subirla y se sube al final, con todo lo demás ya controlado.
    if (imagen && !imagen.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo de perfil tiene que ser una imagen');
    }

    // Solo se cambia lo que llegó.
    if (updatePerfilDto.nombre !== undefined) {
      usuario.nombre = updatePerfilDto.nombre;
    }
    if (updatePerfilDto.apellido !== undefined) {
      usuario.apellido = updatePerfilDto.apellido;
    }
    if (updatePerfilDto.descripcion !== undefined) {
      usuario.descripcion = updatePerfilDto.descripcion;
    }
    if (updatePerfilDto.fechaNacimiento !== undefined) {
      usuario.fechaNacimiento = new Date(updatePerfilDto.fechaNacimiento);
    }
    if (imagen) {
      usuario.imagenUrl = await this.cloudinaryService.subirImagen(imagen, 'potrero-libre/perfiles');
    }
    await usuario.save();

    // Se devuelve sin la contraseña, igual que el login.
    return await this.buscarPorId(id);
  }
}
