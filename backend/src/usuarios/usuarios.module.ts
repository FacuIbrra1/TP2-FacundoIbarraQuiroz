import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { Usuario, UsuarioSchema } from './entities/usuario.entity.js';
import { Ingreso, IngresoSchema } from './entities/ingreso.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Ingreso.name, schema: IngresoSchema }, // Sprint 3: cada login o registro.
    ]),
  ],
  providers: [UsuariosService],
  exports: [UsuariosService], // Lo usa AutenticacionModule para registrar y buscar usuarios.
})
export class UsuariosModule {}
