// Lo que devuelve el back: el usuario nunca trae la contraseña.
export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenUrl: string;
  perfil: string; // 'usuario' | 'administrador'
  tipo: string; // 'jugador' | 'dt' | 'club'
  activo: boolean;
}

// La respuesta del registro y del login. "vence": cuándo vence el token, en milisegundos
// (como Date.now()). Lo agrega el back desde la corrección del Sprint 3.
export interface RespuestaAutenticacion {
  token: string;
  usuario: Usuario;
  vence: number;
}

// Lo que se guarda en el localStorage: el token, el usuario y cuándo vence el token.
// Con "vence" se sabe cuándo mostrar el aviso, aunque se recargue la página o se cambie de pestaña.
export interface Sesion {
  token: string;
  usuario: Usuario;
  vence: number;
}

// La respuesta de POST /auth/refrescar: el token nuevo y cuándo vence.
export interface RespuestaRefrescar {
  token: string;
  vence: number;
}
