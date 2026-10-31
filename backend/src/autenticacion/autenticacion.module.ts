import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service.js';
import { AutenticacionController } from './autenticacion.controller.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  // Traen el UsuariosService y el CloudinaryService que exportan esos módulos.
  // El JwtService no hace falta importarlo: JwtModule es global (ver AppModule).
  imports: [UsuariosModule, CloudinaryModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}
