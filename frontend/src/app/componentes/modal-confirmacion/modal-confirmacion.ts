import { Component, input, output } from '@angular/core';

// Modal para confirmar una acción (el enunciado no permite alert() ni confirm()).
// Como la tarjeta: recibe los textos con input() y avisa al padre con output().
// El padre decide cuándo mostrarlo, con un @if.
@Component({
  imports: [],
  selector: 'app-modal-confirmacion',
  styleUrl: './modal-confirmacion.css',
  templateUrl: './modal-confirmacion.html',
})
export class ModalConfirmacion {
  titulo = input.required<string>();
  mensaje = input.required<string>();
  textoConfirmar = input('Confirmar');
  peligro = input(false); // true: el botón de confirmar va en rojo (por ejemplo, para borrar).
  procesando = input(false); // true mientras el padre espera la respuesta del back.
  error = input<string | null>(null);

  confirmar = output<void>();
  cancelar = output<void>();
}