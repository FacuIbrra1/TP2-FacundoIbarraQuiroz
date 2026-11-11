import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { validarPassword } from '../../validadores/password';
import { mensajesDeError } from '../../api';
import { validarUsuarioOCorreo } from '../../validadores/email';

// Acceso rápido (corrección del Sprint 2, 10/11): la cuenta de administrador de prueba.
// Tiene que existir en la base con perfil "administrador".
const ADMINISTRADOR_DE_PRUEBA = { usuario: 'administrador', password: 'AdminPotrero2026' };

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

  // Se ingresa con el correo o con el nombre de usuario. La contraseña tiene las mismas reglas que en el registro.
  protected form: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, validarUsuarioOCorreo]],
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
    this.enviar(this.form.value.usuario.trim(), this.form.value.password);
  }

  // El botón de acceso rápido: ingresa directo con la cuenta de administrador, sin completar el formulario.
  protected ingresarComoAdministrador() {
    this.enviar(ADMINISTRADOR_DE_PRUEBA.usuario, ADMINISTRADOR_DE_PRUEBA.password);
  }

  // Lo que hacen los dos botones: pedir el login, guardar la sesión e ir a publicaciones.
  private enviar(usuario: string, password: string) {
    this.enviando.set(true);
    this.erroresServidor.set([]);

    this.autenticacion.login(usuario, password).subscribe({
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