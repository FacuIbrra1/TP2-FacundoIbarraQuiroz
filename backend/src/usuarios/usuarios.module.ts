import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { Usuario, UsuarioSchema } from './entities/usuario.entity.js';
import { Ingreso, IngresoSchema } from './entities/ingreso.entity.js';
import { UsuariosController } from './usuarios.controller.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Ingreso.name, schema: IngresoSchema }, // Sprint 3: cada login o registro.
    ]),
    CloudinaryModule, // Para la foto del registro, del alta del administrador y de editar el perfil.
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Lo usa AutenticacionModule para registrar, buscar usuarios y anotar los ingresos.
})
export class UsuariosModule {}
