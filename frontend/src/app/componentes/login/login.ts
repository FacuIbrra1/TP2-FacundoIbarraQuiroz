import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { validarPassword } from '../../validadores/password';
import { mensajesDeError } from '../../api';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  // El login es por correo. La contraseña tiene las mismas reglas que en el registro.
  protected form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), validarPassword]],
  });

  protected readonly enviando = signal(false);
  protected readonly erroresServidor = signal<string[]>([]);

  protected esCampoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  protected ingresar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Muestra los mensajes de todos los campos.
      return;
    }

    this.enviando.set(true);
    this.erroresServidor.set([]);

    this.autenticacion.login(this.form.value.email, this.form.value.password).subscribe({
      next: (respuesta) => {
        this.autenticacion.guardarSesion(respuesta);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.erroresServidor.set(mensajesDeError(error));
        this.enviando.set(false);
      },
    });
  }
}
