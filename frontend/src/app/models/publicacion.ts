// Los datos del autor que el back manda con cada publicación (nunca el correo ni la contraseña).
export interface Autor {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  imagenUrl: string;
  tipo: string; // 'jugador' | 'dt' | 'club'
}

// Una publicación, tal como la devuelve el back.
export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagenUrl: string; // Vacía si no tiene imagen.
  categoria: string; // 'general' | 'busco-club' | 'busco-jugadores' | 'prueba'
  autor: Autor;
  cantidadLikes: number;
  activa: boolean;
  fecha: string;
}

// Los parámetros del listado (GET /publicaciones). categoria y usuario son opcionales.
export interface FiltrosPublicaciones {
  orden: string; // 'fecha' | 'likes'
  offset: number;
  limit: number;
  categoria?: string;
  usuario?: string;
}

// Lo que responde el back al dar o quitar un me gusta.
export interface RespuestaMeGusta {
  message: string;
  cantidadLikes: number;
}