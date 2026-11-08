import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

export type PublicacionDocument = HydratedDocument<Publicacion>;

// toJSON / toObject con virtuals: sin esto, el virtual "comentarios" no aparece en la respuesta.
@Schema({
  collection: 'publicaciones', // Sin esto, Mongoose la llamaría "publicacions".
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export class Publicacion {
    @Prop({ required: true, trim: true, maxlength: 100 })
    titulo: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    mensaje: string;

    // La imagen es opcional: si no se sube, queda vacía.
    @Prop({ default: '' })
    imagenUrl: string;

    // Potrero Libre: para filtrar el listado.
    @Prop({enum: ['general', 'busco-club', 'busco-jugadores', 'prueba'], default: 'general'})
    categoria: string;

    // Quién la publicó (sale del token). mongoose.Schema.Types.ObjectId y no Types.ObjectId:
    // con Types.ObjectId se guarda como texto y populate no lo encuentra (lo vimos en el ejercicio-1).
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Usuario.name, required: true})
    autor: Types.ObjectId;

    // Se actualiza con $inc al dar o quitar un me gusta. Sirve para ordenar por me gusta.
    @Prop({ default: 0 })
    cantidadLikes: number;

    // Baja lógica: DELETE la pone en false y deja de aparecer en el listado.
    @Prop({ default: true })
    activa: boolean;

    // Date.now sin paréntesis: Mongoose lo llama al crear cada publicación.
    @Prop({ default: Date.now })
    fecha: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// Los comentarios de la publicación: no se guardan acá, se buscan al consultar
// (virtual populate, como "libros" en el Autor del ejercicio-1).
PublicacionSchema.virtual('comentarios', {
  ref: 'Comentario',
  localField: '_id',
  foreignField: 'publicacion',
});