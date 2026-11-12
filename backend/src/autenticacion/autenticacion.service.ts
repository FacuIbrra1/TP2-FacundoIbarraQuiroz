import {BadRequestException, ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Types } from 'mongoose';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
  ) {}

 // ---- REGISTRO ----:
  async registro(
    createUsuarioDto: CreateUsuarioDto,
    imagen: Express.Multer.File,
  ) {
    // 400: la imagen de perfil es obligatoria y tiene que ser una imagen.
    if (!imagen) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }
    if (!imagen.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'El archivo de perfil tiene que ser una imagen',
      );
    }

    // 409: se revisa antes de crear, así se puede avisar cuál de los dos datos está repetido.
    const emailEnUso = await this.usuariosService.buscarPorEmail(
      createUsuarioDto.email,
    );
    if (emailEnUso) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const usernameEnUso = await this.usuariosService.buscarPorUsername(
      createUsuarioDto.username,
    );
    if (usernameEnUso) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    // El apellido depende del tipo de cuenta: un club no tiene (si llegó uno, no se guarda), jugador y DT lo necesitan.
    if (createUsuarioDto.tipo === 'club') {
      createUsuarioDto.apellido = '';
    } 
    else if (!createUsuarioDto.apellido) {
      throw new BadRequestException('El apellido es obligatorio');
    }

    // Recién con todo validado se sube la imagen, para no dejar imágenes sueltas en Cloudinary.
    const imagenUrl = await this.cloudinaryService.subirImagen(
      imagen,
      'potrero-libre/perfiles',
    );

    // 10 = cuántas "vueltas" da bcrypt al encriptar. Más vueltas, más difícil de adivinar.
    const passwordEncriptada = await bcrypt.hash(createUsuarioDto.password, 10);

    const nuevoUsuario = await this.usuariosService.crear(
      createUsuarioDto,
      passwordEncriptada,
      imagenUrl,
    );

    return await this.respuestaConToken(nuevoUsuario);
  }


 // ---- LOGIN ----:
  async login(loginDto: LoginDto) {
    // Se puede ingresar con el correo o con el nombre de usuario (los dos son únicos).
    // Primero se busca por correo y, si no hay ninguno, por nombre de usuario.
    let usuario = await this.usuariosService.buscarPorEmail(loginDto.usuario);
    if (!usuario) {
      usuario = await this.usuariosService.buscarPorUsername(loginDto.usuario);
    }

    // bcrypt encripta la contraseña recibida y la compara con la guardada.
    // Mismo mensaje en los dos casos: no se le dice a nadie qué cuentas existen.
    if ( !usuario || !(await bcrypt.compare(loginDto.password, usuario.password))) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return await this.respuestaConToken(usuario);
  }

  // ---- RESPUESTA CON TOKEN ----:
  // Lo que devuelven el registro y el login: el token y los datos del usuario, sin la contraseña.
  private async respuestaConToken(usuario: UsuarioDocument) {
    // El token lleva quién es (sub), su nombre de usuario y su perfil.
    const payload = {
      sub: usuario._id,
      username: usuario.username,
      perfil: usuario.perfil,
    };
    const token = await this.jwtService.signAsync(payload);

    // Sprint 3: cada login o registro queda anotado en "ingresos" (para las estadísticas del Sprint 5).
    await this.usuariosService.registrarIngreso(usuario._id);

    const datosUsuario = await this.usuariosService.buscarPorId(usuario._id);

    return { token: token, usuario: datosUsuario };
  }

  
  // ---- AUTORIZAR ----
  // El token ya lo validó el AuthGuard (401 si falta, es inválido o venció).
  // Se devuelven los datos actuales del usuario, sin la contraseña.
  async autorizar(id: Types.ObjectId) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) {
      throw new UnauthorizedException('El usuario del token ya no existe');
    }
    return usuario;
  }


  // ---- REFRESCAR ----
  // Un token nuevo con el mismo contenido (id, nombre de usuario y perfil) y otros 15 minutos.
  // No se firma el payload viejo tal cual: trae "iat" y "exp" (cuándo se creó y cuándo vence),
  // y signAsync no acepta un payload que ya tiene "exp". Por eso se copian solo los tres datos.
  async refrescar(payload: any) {
    const nuevoPayload = {
      sub: payload.sub,
      username: payload.username,
      perfil: payload.perfil,
    };
    const token = await this.jwtService.signAsync(nuevoPayload);
    return { token: token };
  }
}
