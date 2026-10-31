import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  // unique: crea un índice en Mongo, no permite dos usuarios con el mismo correo.
  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  // Se guarda encriptada. Nunca se devuelve: las consultas usan .select('-password').
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '', trim: true, maxlength: 200 })
  descripcion: string;

  @Prop({ required: true })
  imagenUrl: string;

  // El "perfil" del enunciado. Nadie lo elige al registrarse: siempre arranca en 'usuario'.
  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: string;

  // Potrero Libre: el tipo de cuenta. Una cuenta de club la maneja su delegado.
  @Prop({ enum: ['jugador', 'dt', 'club'], required: true })
  tipo: string;

  // Baja lógica (Sprint 4): un usuario deshabilitado no puede iniciar sesión.
  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
