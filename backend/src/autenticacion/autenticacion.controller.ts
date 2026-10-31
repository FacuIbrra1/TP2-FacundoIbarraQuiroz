import {Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service.js';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // multipart/form-data: los datos llegan en el body y la foto en el campo "imagen".
  // limits: hasta 2 MB; si pesa más, responde 413.
  @Post('registro')
  @UseInterceptors(FileInterceptor('imagen', { limits: { fileSize: 2 * 1024 * 1024 } }))
  registro(@Body() createUsuarioDto: CreateUsuarioDto, @UploadedFile() imagen: Express.Multer.File) {
    return this.autenticacionService.registro(createUsuarioDto, imagen);
  }

  @Post('login')
  @HttpCode(200) // Un POST responde 201 por defecto, pero el login no crea nada.
  login(@Body() loginDto: LoginDto) {
    return this.autenticacionService.login(loginDto);
  }
}
