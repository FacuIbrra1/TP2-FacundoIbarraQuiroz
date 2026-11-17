import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
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


  // ---- CREAR UNA CUENTA ----
  // Sprint 4: esta lógica estaba en el registro (AutenticacionService). Se movió acá porque ahora
  // la usan dos rutas: el registro (perfil siempre 'usuario') y el alta del administrador
  // (POST /usuarios, que elige el perfil). Así las validaciones están en un solo lugar.
  async crear(createUsuarioDto: CreateUsuarioDto, imagen: Express.Multer.File, perfil: string) {
    // Sprint 4: el tipo 'administrador' es solo para cuentas con perfil administrador.
    if (createUsuarioDto.tipo === 'administrador' && perfil !== 'administrador') {
      throw new BadRequestException('El tipo de cuenta administrador es solo para el perfil administrador');
    }

    // 400: la imagen de perfil es obligatoria y tiene que ser una imagen.
    if (!imagen) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    if (!imagen.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo de perfil tiene que ser una imagen');
    }

    // 409: se revisa antes de crear, así se puede avisar cuál de los dos datos está repetido.
    const emailEnUso = await this.buscarPorEmail(createUsuarioDto.email);
    if (emailEnUso) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const usernameEnUso = await this.buscarPorUsername(createUsuarioDto.username);
    if (usernameEnUso) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    // El apellido depende del tipo de cuenta: un club no tiene (si llegó uno, no se guarda);
    // jugador, DT y administrador son personas y lo necesitan.
    if (createUsuarioDto.tipo === 'club') {
      createUsuarioDto.apellido = '';
    } else if (!createUsuarioDto.apellido) {
      throw new BadRequestException('El apellido es obligatorio');
    }

    // Recién con todo validado se sube la imagen, para no dejar imágenes sueltas en Cloudinary.
    const imagenUrl = await this.cloudinaryService.subirImagen(imagen, 'potrero-libre/perfiles');

    // 10 = cuántas "vueltas" da bcrypt al encriptar. Más vueltas, más difícil de adivinar.
    const passwordEncriptada = await bcrypt.hash(createUsuarioDto.password, 10);

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
      perfil: perfil,
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


  // ---- LISTAR (Sprint 4, administrador) ----
  // Todos, habilitados y deshabilitados (el dashboard muestra el estado de cada uno), sin contraseñas.
  // Ordenados por nombre de usuario, como una lista de contactos.
  async listar() {
    return await this.usuarioModel.find().select('-password').sort('username');
  }


  // ---- DESHABILITAR (Sprint 4, baja lógica) ----
  // No se borra: pasa a activo: false, y el login le avisa que su cuenta está deshabilitada.
  async deshabilitar(id: Types.ObjectId, administradorId: string) {
    // 400: un administrador no se puede deshabilitar a sí mismo (se quedaría afuera de su propia cuenta).
    // id es un ObjectId y administradorId es texto (viene del token): se comparan como texto.
    if (id.toString() === administradorId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }

    return await this.cambiarEstado(id, false);
  }


  // ---- HABILITAR (Sprint 4, alta lógica) ----
  async habilitar(id: Types.ObjectId) {
    return await this.cambiarEstado(id, true);
  }


  // Deshabilitar y habilitar hacen lo mismo con distinto valor: buscar (404), cambiar "activo" y guardar.
  private async cambiarEstado(id: Types.ObjectId, activo: boolean) {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }

    usuario.activo = activo;
    await usuario.save();

    // Se devuelve sin la contraseña: el dashboard actualiza esa fila con lo que llega.
    return await this.buscarPorId(id);
  }
}
