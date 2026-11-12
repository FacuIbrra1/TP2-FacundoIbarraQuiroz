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

// La respuesta del registro y del login.
export interface RespuestaAutenticacion {
  token: string;
  usuario: Usuario;
}

// Lo que se guarda en el localStorage: el token, el usuario y cuándo se obtuvo el token
// (Date.now(), en milisegundos). Con "inicio" se sabe cuándo mostrar el aviso de los 10 minutos,
// aunque se recargue la página.
export interface Sesion {
  token: string;
  usuario: Usuario;
  inicio: number;
}

// La respuesta de POST /auth/refrescar.
export interface RespuestaRefrescar {
  token: string;
}
