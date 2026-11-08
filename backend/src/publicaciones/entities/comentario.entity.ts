import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { Publicacion } from './publicacion.entity.js';

export type ComentarioDocument = HydratedDocument<Comentario>;

// Sprint 2: solo el modelo, para que Mi Perfil muestre los comentarios.
// Las rutas para comentar y editar son del Sprint 3.
@Schema()
export class Comentario {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Publicacion.name, required: true})
    publicacion: Types.ObjectId;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Usuario.name, required: true})
    autor: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 500 })
    mensaje: string;

    // Sprint 3: al editarlo pasa a true y el front muestra "(editado)".
    @Prop({ default: false })
    modificado: boolean;

    @Prop({ default: Date.now })
    fecha: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);