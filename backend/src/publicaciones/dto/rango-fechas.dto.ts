import { IsDateString, Matches } from 'class-validator';

// El lapso de las estadísticas (Sprint 4), los dos obligatorios:
//   /estadisticas/publicaciones-por-usuario?desde=2026-11-01&hasta=2026-11-30
// Son días enteros, los dos incluidos. Llegan como texto porque son parte de la URL.
export class RangoFechasDto {
  // Matches: solo el día (AAAA-MM-DD), sin hora.
  // IsDateString con strict (como la fecha de nacimiento del registro): que el día exista (rechaza 2026-02-30).
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha desde tiene que tener el formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha desde no es válida' })
  desde: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha hasta tiene que tener el formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha hasta no es válida' })
  hasta: string;
}
