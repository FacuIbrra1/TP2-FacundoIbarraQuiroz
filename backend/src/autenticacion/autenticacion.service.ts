import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { Types } from 'mongoose';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

 // ---- REGISTRO ----:
  // Sprint 4: las validaciones y el alta pasaron a UsuariosService.crear(), porque ahora también
  // las usa el administrador para dar de alta usuarios. Quien se registra solo puede ser 'usuario'.
  async registro(createUsuarioDto: CreateUsuarioDto, imagen: Express.Multer.File) {
    const nuevoUsuario = await this.usuariosService.crear(createUsuarioDto, imagen, 'usuario');
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

    // Sprint 4: una cuenta deshabilitada por un administrador no puede entrar, y se le avisa por qué.
    // Se controla DESPUÉS de la contraseña: así nadie puede averiguar si una cuenta está deshabilitada
    // sin saber su contraseña. 403 y no 401: los datos son correctos, pero no tiene permiso para entrar.
    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Comunicate con un administrador.');
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

    return { token: token, usuario: datosUsuario, vence: this.vencimiento(token) };
  }

  // Corrección del Sprint 3: cuándo vence el token, en milisegundos (como Date.now() en el front).
  // decode lee el contenido del token (sin volver a verificar la firma: lo acabamos de firmar).
  // "exp" viene en segundos: por eso se multiplica por 1000.
  private vencimiento(token: string): number {
    const contenido = this.jwtService.decode(token);
    return contenido.exp * 1000;
  }

  
  // ---- AUTORIZAR ----
  // El token ya lo validó el AuthGuard (401 si falta, es inválido o venció).
  // Se devuelven los datos actuales del usuario, sin la contraseña.
  async autorizar(id: Types.ObjectId) {
    return await this.usuarioHabilitado(id);
  }


  // ---- REFRESCAR ----
  // Un token nuevo (id, nombre de usuario y perfil) con otros 15 minutos.
  // No se firma el payload viejo tal cual: trae "iat" y "exp" (cuándo se creó y cuándo vence),
  // y signAsync no acepta un payload que ya tiene "exp". Por eso se arma uno nuevo.
  // Sprint 4: los datos salen de la base y no del token viejo, así una cuenta deshabilitada
  // no puede seguir extendiendo su sesión.
  async refrescar(payload: any) {
    const usuario = await this.usuarioHabilitado(payload.sub);
    const nuevoPayload = {
      sub: usuario._id,
      username: usuario.username,
      perfil: usuario.perfil,
    };
    const token = await this.jwtService.signAsync(nuevoPayload);
    return { token: token, vence: this.vencimiento(token) };
  }


  // Autorizar y refrescar empiezan igual: el usuario del token tiene que existir y estar habilitado.
  // 401 en los dos casos: esa sesión ya no sirve y el front lleva al login (donde, si está
  // deshabilitado, el login le explica por qué).
  private async usuarioHabilitado(id: Types.ObjectId) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) {
      throw new UnauthorizedException('El usuario del token ya no existe');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }
    return usuario;
  }
}
