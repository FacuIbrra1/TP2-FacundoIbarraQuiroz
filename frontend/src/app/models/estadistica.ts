// Sprint 4: lo que devuelven las rutas de estadísticas (una por gráfico).

// GET /estadisticas/publicaciones-por-usuario
export interface PublicacionesPorUsuario {
  username: string;
  cantidad: number;
}

// GET /estadisticas/comentarios-por-dia: el total del lapso y la cantidad de cada día (días sin comentarios en 0).
export interface ComentariosPorDia {
  total: number;
  dias: { dia: string; cantidad: number }[]; // dia: '2026-11-01'
}

// GET /estadisticas/comentarios-por-publicacion
export interface ComentariosPorPublicacion {
  id: string;
  titulo: string;
  cantidad: number;
}
