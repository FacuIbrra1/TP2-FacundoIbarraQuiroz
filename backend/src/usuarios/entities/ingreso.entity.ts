import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Usuario } from './usuario.entity.js';

export type IngresoDocument = HydratedDocument<Ingreso>;

// Un documento por cada vez que alguien entra (login o registro): quién y cuándo.
// Se empieza a guardar en el Sprint 3 para que las estadísticas de ingresos del Sprint 5 tengan datos.
@Schema({ collection: 'ingresos' })
export class Ingreso {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha: Date;
}

export const IngresoSchema = SchemaFactory.createForClass(Ingreso);
