import { PartialType } from '@nestjs/mapped-types';
import { CreateAutenticacionDto } from './create-autenticacion.dto.js';

export class UpdateAutenticacionDto extends PartialType(CreateAutenticacionDto) {}
