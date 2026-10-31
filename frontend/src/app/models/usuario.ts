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
