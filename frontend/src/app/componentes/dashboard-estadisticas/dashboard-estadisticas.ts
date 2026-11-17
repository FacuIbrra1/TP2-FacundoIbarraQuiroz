import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { EstadisticasService } from '../../servicios/estadisticas-service';
import { ComentariosPorDia, ComentariosPorPublicacion, PublicacionesPorUsuario } from '../../models/estadistica';
import { rangoDeFechas } from '../../validadores/estadisticas';
import { mensajesDeError } from '../../api';

// Los gráficos se dibujan en un <canvas>, que no entiende las variables de CSS (var(--...)):
// por eso los colores de la app van acá escritos.
const TEXTO_SUAVE = '#9db2c7'; // --texto-suave
const LINEAS = '#15304a'; // --superficie-alta
const SUPERFICIE = '#0d2131'; // --superficie: separa las porciones de la torta
const COLOR_SERIE = '#3987e5'; // Barras y línea (una sola serie: un solo color)
// Torta: hasta 5 publicaciones con color propio y el resto juntas en "Otras", en gris.
// Son colores que se distinguen entre sí también con daltonismo.
const COLORES_TORTA = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181'];
const COLOR_OTRAS = '#5f7489';

// Para todos los gráficos: texto, líneas de la grilla y letra como el resto de la app.
Chart.defaults.color = TEXTO_SUAVE;
Chart.defaults.borderColor = LINEAS;
Chart.defaults.font.family = 'Barlow, system-ui, sans-serif';

// Una fecha como 'AAAA-MM-DD' (el formato del input date y el que espera el back), en hora local.
function fechaComoTexto(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // getMonth() empieza en 0.
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Sprint 4: dashboard/estadisticas (solo administradores). Tres gráficos de tipos distintos
// (barras, líneas y torta) con Chart.js, y un lapso de fechas para elegir.
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-dashboard-estadisticas',
  styleUrl: './dashboard-estadisticas.css',
  templateUrl: './dashboard-estadisticas.html',
})
export class DashboardEstadisticas implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly estadisticasService = inject(EstadisticasService);

  // Por defecto, los últimos 30 días (hoy incluido).
  protected form: FormGroup = this.fb.group(
    {
      desde: [fechaComoTexto(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)), Validators.required],
      hasta: [fechaComoTexto(new Date()), Validators.required],
    },
    { validators: rangoDeFechas },
  );

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly totalComentarios = signal(0);

  // true: ese gráfico no tiene datos en el lapso (se muestra un mensaje en lugar del gráfico).
  protected readonly sinPublicaciones = signal(false);
  protected readonly sinComentarios = signal(false);
  protected readonly sinComentariosPorPublicacion = signal(false);

  // Los tres gráficos. Hay que guardarlos para destruirlos antes de dibujar otros en el mismo canvas.
  private graficoBarras: Chart | undefined;
  private graficoLineas: Chart | undefined;
  private graficoTorta: Chart | undefined;
  private pendientes = 0; // Cuántos de los tres pedidos faltan responder.

  ngOnInit(): void {
    this.cargar();
  }

  // Al salir de la pantalla se destruyen los gráficos (como el clearInterval de la sesión: no dejar nada andando).
  ngOnDestroy(): void {
    this.graficoBarras?.destroy();
    this.graficoLineas?.destroy();
    this.graficoTorta?.destroy();
  }

  protected esCampoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  // "Ver estadísticas": con el lapso nuevo se vuelven a pedir los datos y se redibujan los tres gráficos.
  protected aplicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargar();
  }

  // Los tres pedidos van a la vez y cada uno dibuja su gráfico cuando llega.
  private cargar() {
    const desde = this.form.value.desde;
    const hasta = this.form.value.hasta;

    this.cargando.set(true);
    this.error.set(null);
    this.pendientes = 3;

    this.estadisticasService.publicacionesPorUsuario(desde, hasta).subscribe({
      next: (datos) => {
        this.dibujarBarras(datos);
        this.terminoUnPedido();
      },
      error: (error) => this.fallo(error),
    });

    this.estadisticasService.comentariosPorDia(desde, hasta).subscribe({
      next: (datos) => {
        this.dibujarLineas(datos);
        this.terminoUnPedido();
      },
      error: (error) => this.fallo(error),
    });

    this.estadisticasService.comentariosPorPublicacion(desde, hasta).subscribe({
      next: (datos) => {
        this.dibujarTorta(datos);
        this.terminoUnPedido();
      },
      error: (error) => this.fallo(error),
    });
  }

  private terminoUnPedido() {
    this.pendientes--;
    if (this.pendientes === 0) {
      this.cargando.set(false);
    }
  }

  private fallo(error: any) {
    this.error.set(mensajesDeError(error)[0]);
    this.terminoUnPedido();
  }

  // ---- 1. Publicaciones por usuario: barras ----
  private dibujarBarras(datos: PublicacionesPorUsuario[]) {
    this.graficoBarras?.destroy(); // El gráfico anterior (si había) se borra del canvas.
    this.sinPublicaciones.set(datos.length === 0);
    if (datos.length === 0) {
      return;
    }

    // new Chart(id del canvas, configuración): type, data (etiquetas y valores) y options.
    this.graficoBarras = new Chart('grafico-publicaciones', {
      type: 'bar',
      data: {
        labels: datos.map((fila) => '@' + fila.username),
        datasets: [
          {
            label: 'Publicaciones',
            data: datos.map((fila) => fila.cantidad),
            backgroundColor: COLOR_SERIE,
            borderRadius: 4,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        maintainAspectRatio: false, // Toma el alto de su contenedor (CSS), no uno fijo.
        plugins: { legend: { display: false } }, // Una sola serie: el título de la tarjeta ya dice qué es.
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }, // precision 0: sin "1.5 publicaciones".
          x: { grid: { display: false } },
        },
      },
    });
  }

  // ---- 2. Comentarios en el lapso: líneas, un punto por día ----
  private dibujarLineas(datos: ComentariosPorDia) {
    this.graficoLineas?.destroy();
    this.totalComentarios.set(datos.total);
    this.sinComentarios.set(datos.total === 0);
    if (datos.total === 0) {
      return;
    }

    this.graficoLineas = new Chart('grafico-comentarios', {
      type: 'line',
      data: {
        // '2026-11-05' → '05/11'
        labels: datos.dias.map((fila) => fila.dia.slice(8, 10) + '/' + fila.dia.slice(5, 7)),
        datasets: [
          {
            label: 'Comentarios',
            data: datos.dias.map((fila) => fila.cantidad),
            borderColor: COLOR_SERIE,
            backgroundColor: COLOR_SERIE,
            borderWidth: 2,
            pointRadius: 4, // Un punto por día, con líneas rectas entre ellos.
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // ---- 3. Comentarios por publicación: torta ----
  private dibujarTorta(datos: ComentariosPorPublicacion[]) {
    this.graficoTorta?.destroy();
    this.sinComentariosPorPublicacion.set(datos.length === 0);
    if (datos.length === 0) {
      return;
    }

    // Llegan de mayor a menor: las 5 primeras con su color, y si hay más, se suman en "Otras".
    // (Con muchas porciones de colores parecidos, la torta ya no se entiende).
    const principales = datos.slice(0, 5);
    const etiquetas = principales.map((fila) => this.recortar(fila.titulo));
    const cantidades = principales.map((fila) => fila.cantidad);
    const colores = COLORES_TORTA.slice(0, principales.length);

    const resto = datos.slice(5);
    if (resto.length > 0) {
      let suma = 0;
      for (const fila of resto) {
        suma += fila.cantidad;
      }
      etiquetas.push(`Otras ${resto.length} publicaciones`);
      cantidades.push(suma);
      colores.push(COLOR_OTRAS);
    }

    this.graficoTorta = new Chart('grafico-por-publicacion', {
      type: 'pie',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Comentarios',
            data: cantidades,
            backgroundColor: colores,
            borderColor: SUPERFICIE, // Una línea del color de la tarjeta entre porción y porción.
            borderWidth: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }, // Varias porciones: acá sí hace falta la leyenda.
      },
    });
  }

  // Los títulos largos se cortan para que entren en la leyenda.
  private recortar(titulo: string): string {
    return titulo.length > 28 ? titulo.slice(0, 27) + '…' : titulo;
  }
}
