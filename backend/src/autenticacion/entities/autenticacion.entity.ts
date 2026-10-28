import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { TIPOS } from '../../usuarios/entities/usuario.entity.js';
import type { Tipo } from '../../usuarios/entities/usuario.entity.js';

export class Autenticacion {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre: string;

    @IsString()
    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    apellido: string;

    @IsEmail({}, { message: 'El correo no tiene un formato válido' })
    email: string;

    @IsString()
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    @MaxLength(20, { message: 'El nombre de usuario no puede superar los 20 caracteres' })
    username: string;

    // (?=.*[A-Z]) -> en algún lugar hay una mayúscula.
    // (?=.*\d)    -> en algún lugar hay un número.
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'La contraseña debe tener al menos una mayúscula y un número',
    })
    password: string;

    // strict: además del formato AAAA-MM-DD, controla que la fecha exista (rechaza 2001-02-30).
    @IsDateString({ strict: true }, { message: 'La fecha de nacimiento no es válida' })
    fechaNacimiento: string;

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
    descripcion?: string;

    @IsIn(TIPOS, { message: 'El tipo de cuenta debe ser jugador, dt o club' })
    tipo: Tipo;
}

