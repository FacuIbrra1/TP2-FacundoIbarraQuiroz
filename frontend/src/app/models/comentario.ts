import { Autor } from './publicacion';

// Un comentario, tal como lo devuelve el back (el autor viene con sus datos, como en las publicaciones).
export interface Comentario {
  _id: string;
  publicacion: string;
  autor: Autor;
  mensaje: string;
  modificado: boolean; // Sprint 3: true cuando el autor lo editó.
  fecha: string;
}