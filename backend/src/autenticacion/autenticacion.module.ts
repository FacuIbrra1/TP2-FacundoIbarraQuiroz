import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service.js';
import { AutenticacionController } from './autenticacion.controller.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

@Module({
  // Trae el UsuariosService que exporta UsuariosModule.
  // (Sprint 4: el CloudinaryModule ya no hace falta acá: la foto del registro la sube UsuariosService).
  // El JwtService no hace falta importarlo: JwtModule es global (ver AppModule).
  imports: [UsuariosModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}
