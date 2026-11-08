import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';

export type LikeDocument = HydratedDocument<Like>;

// Un documento por cada me gusta: quién, a qué publicación y cuándo.
@Schema()
export class Like {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Publicacion.name, required: true})
    publicacion: Types.ObjectId;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Usuario.name, required: true})
    usuario: Types.ObjectId;

    // Para las estadísticas de me gusta por día (Sprint 5).
    @Prop({ default: Date.now })
    fecha: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);