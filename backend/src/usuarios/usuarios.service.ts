import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario } from './entities/usuario.entity.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
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
}
