import {IsNotEmpty, IsString } from 'class-validator';

// El login es con el correo o con el nombre de usuario (los dos son únicos en la base).
// La contraseña llega sin encriptar.
export class LoginDto {
  @IsString({ message: 'El correo o nombre de usuario tiene que ser un texto' })
  @IsNotEmpty({ message: 'Ingresá tu correo o tu nombre de usuario' })
  usuario: string;

  @IsString({ message: 'La contraseña tiene que ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
