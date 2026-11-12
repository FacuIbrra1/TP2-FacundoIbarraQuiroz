import { IsNumberString, IsOptional } from 'class-validator';

// La paginación de los comentarios, los dos opcionales:
// /publicaciones/:id/comentarios?offset=0&limit=5
// Igual que en ListarPublicacionesDto: llegan como texto porque son parte de la URL.
export class ListarComentariosDto {
    // no_symbols: solo dígitos (rechaza "-1", "1.5" y "abc").
    @IsOptional()
    @IsNumberString({ no_symbols: true }, { message: 'El offset tiene que ser un número entero, 0 o mayor' })
    offset?: string;

    @IsOptional()
    @IsNumberString({ no_symbols: true }, { message: 'El limit tiene que ser un número entero' })
    limit?: string;
}