import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { Comentario } from './entities/comentario.entity.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

// Argentina (UTC-3).
// En la base las fechas están en UTC; sin esto, un comentario de las 22:00 contaría para el día siguiente.
const ZONA_HORARIA = '-03:00';
const TRES_HORAS_MS = 3 * 60 * 60 * 1000;
const UN_DIA_MS = 24 * 60 * 60 * 1000;

// Sprint 4: los datos de los tres gráficos del dashboard.
// Cuentan todo lo que se hizo en el lapso, también lo que después se dio de baja: son publicaciones
// y comentarios "realizados" en esas fechas (lo que dice el enunciado).
// La forma de contar es siempre la misma: traer con find lo que cae en el lapso y recorrerlo,
// sumando 1 en la fila que corresponde.
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
  ) {}

  // ---- PUBLICACIONES POR USUARIO ----
  // [{ username: 'FacuIbarraQuiroz22', cantidad: 3 }, ...] de mayor a menor (gráfico de barras).
  async publicacionesPorUsuario(rango: RangoFechasDto) {
    // populate (como en el listado): de cada autor solo hace falta el nombre de usuario.
    const publicaciones = await this.publicacionModel
      .find({ fecha: this.condicionDeFecha(rango) })
      .populate('autor', 'username');

    const resultado: { username: string; cantidad: number }[] = [];
    for (const publicacion of publicaciones) {
      // Después del populate, autor ya no es un id: es el usuario (con su username).
      const autor = publicacion.autor as any;
      const fila = resultado.find((f) => f.username === autor.username);
      if (fila) {
        fila.cantidad++; // Ese usuario ya tenía una fila: suma 1.
      } else {
        resultado.push({ username: autor.username, cantidad: 1 }); // Primera publicación de ese usuario.
      }
    }

    // De mayor a menor: si la resta da positivo, b va antes que a.
    return resultado.sort((a, b) => b.cantidad - a.cantidad);
  }


  // ---- COMENTARIOS EN EL LAPSO ----
  // { total: 12, dias: [{ dia: '2026-11-01', cantidad: 0 }, ...] } (gráfico de líneas, un punto por día).
  async comentariosPorDia(rango: RangoFechasDto) {
    const comentarios = await this.comentarioModel
      .find({ fecha: this.condicionDeFecha(rango) })
      .select('fecha'); // Solo hace falta la fecha.

    // Primero, todos los días del lapso en 0: así la línea muestra también los días sin comentarios.
    // new Date('2026-11-01') es ese día a las 00:00 UTC; se suma un día por vuelta hasta llegar a "hasta".
    const dias: { dia: string; cantidad: number }[] = [];
    const ultimo = new Date(rango.hasta);
    for (let dia = new Date(rango.desde); dia <= ultimo; dia = new Date(dia.getTime() + UN_DIA_MS)) {
      dias.push({ dia: dia.toISOString().slice(0, 10), cantidad: 0 }); // "2026-11-01T00:00:00.000Z" → "2026-11-01"
    }

    // Después, cada comentario suma 1 en su día. Para saber qué día era en Argentina,
    // a la fecha (en UTC) se le restan 3 horas.
    for (const comentario of comentarios) {
      const dia = new Date(comentario.fecha.getTime() - TRES_HORAS_MS).toISOString().slice(0, 10);
      const fila = dias.find((d) => d.dia === dia);
      if (fila) {
        fila.cantidad++;
      }
    }

    return { total: comentarios.length, dias: dias };
  }


  // ---- COMENTARIOS POR PUBLICACIÓN ----
  // [{ id: '...', titulo: 'Busco club', cantidad: 4 }, ...] de mayor a menor (gráfico de torta).
  // Se agrupa por id y no por título: dos publicaciones pueden llamarse igual.
  async comentariosPorPublicacion(rango: RangoFechasDto) {
    const comentarios = await this.comentarioModel
      .find({ fecha: this.condicionDeFecha(rango) })
      .populate('publicacion', 'titulo');

    const resultado: { id: string; titulo: string; cantidad: number }[] = [];
    for (const comentario of comentarios) {
      const publicacion = comentario.publicacion as any;
      const id = publicacion._id.toString();
      const fila = resultado.find((f) => f.id === id);
      if (fila) {
        fila.cantidad++;
      } else {
        resultado.push({ id: id, titulo: publicacion.titulo, cantidad: 1 });
      }
    }

    return resultado.sort((a, b) => b.cantidad - a.cantidad);
  }


  // El lapso como condición de Mongo para el campo "fecha":
  //   $gte = mayor o igual (desde las 00:00 del primer día)
  //   $lte = menor o igual (hasta las 23:59:59.999 del último: ese día también se cuenta entero)
  private condicionDeFecha(rango: RangoFechasDto) {
    // Con el formato AAAA-MM-DD, comparar los textos es comparar las fechas ("2026-11-30" > "2026-11-01").
    if (rango.desde > rango.hasta) {
      throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    }

    return {
      $gte: new Date(`${rango.desde}T00:00:00${ZONA_HORARIA}`),
      $lte: new Date(`${rango.hasta}T23:59:59.999${ZONA_HORARIA}`),
    };
  }
}
