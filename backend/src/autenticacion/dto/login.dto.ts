import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// El login es por correo (único en la base). La contraseña llega sin encriptar.
export class LoginDto {
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  email: string;

  @IsString({ message: 'La contraseña tiene que ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
