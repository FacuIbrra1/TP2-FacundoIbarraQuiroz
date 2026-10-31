import {BadRequestException, ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService, 
    private readonly jwtService: JwtService) {}

  async registro(createUsuarioDto: CreateUsuarioDto, imagen: Express.Multer.File) {
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

    // Recién con todo validado se sube la imagen, para no dejar imágenes sueltas en Cloudinary.
    const imagenUrl = await this.cloudinaryService.subirImagen(
      imagen,
      'potrero-libre/perfiles',
    );

    // 10 = cuántas "vueltas" da bcrypt al encriptar. Más vueltas, más difícil de adivinar.
    const passwordEncriptada = await bcrypt.hash(createUsuarioDto.password, 10);

    const nuevoUsuario = await this.usuariosService.crear(createUsuarioDto, passwordEncriptada, imagenUrl);

    return await this.respuestaConToken(nuevoUsuario);
  }



  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorEmail(loginDto.email);

    // bcrypt encripta la contraseña recibida y la compara con la guardada.
    // Mismo mensaje en los dos casos: no se le dice a nadie qué correos existen.
    if (!usuario || !(await bcrypt.compare(loginDto.password, usuario.password))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    return await this.respuestaConToken(usuario);
  }



  // Lo que devuelven el registro y el login: el token y los datos del usuario, sin la contraseña.
  private async respuestaConToken(usuario: UsuarioDocument) {
    // El token lleva quién es (sub), su nombre de usuario y su perfil.
    const payload = {
      sub: usuario._id,
      username: usuario.username,
      perfil: usuario.perfil,
    };
    
    const token = await this.jwtService.signAsync(payload);

    const datosUsuario = await this.usuariosService.buscarPorId(usuario._id);

    return { token: token, usuario: datosUsuario };
  }
}
