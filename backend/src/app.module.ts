import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AutenticacionModule } from './autenticacion/autenticacion.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';

@Module({
  imports: [
    // Primero: carga el .env antes de que MongooseModule y JwtModule lean sus variables.
    ConfigModule.forRoot(),
    // lazyConnection: Nest no espera a que Mongo conecte para arrancar; se conecta en segundo plano y las consultas esperan solas. 
    // Vercel necesita que el back arranque en menos de 1s.
    MongooseModule.forRoot(process.env.MONGO_URI!, { lazyConnection: true }),
    // global: true (como en el ejemplo de cookies) deja el JwtService disponible en todos los módulos.
    // Va acá y no en AutenticacionModule: ese archivo se carga antes que el .env, y JWT_SECRET llegaría vacío.
    // Cambio a 30s solo para la presentacion sino se queda en 15m
    JwtModule.register({global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: '15m' }}),
    UsuariosModule,
    AutenticacionModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
