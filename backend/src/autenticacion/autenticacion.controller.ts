import {Body, Controller, HttpCode, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service.js';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';

@Controller('auth')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // multipart/form-data: los datos llegan en el body y la foto en el campo "imagen".
  // memoryStorage (como en el ejemplo de clase): la imagen queda en memoria para Cloudinary.
  // limits: hasta 2 MB; si pesa más, responde 413.
  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  registro(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    return this.autenticacionService.registro(createUsuarioDto, imagen);
  }

  @Post('login')
  @HttpCode(200) // Un POST responde 201 por defecto, pero el login no crea nada.
  login(@Body() loginDto: LoginDto) {
    return this.autenticacionService.login(loginDto);
  }

  // POST /auth/autorizar → el AuthGuard valida el token (401 si falta, es inválido o venció).
  // Si es válido, devuelve los datos del usuario. La usa la pantalla de cargando del front.
  // (Reemplaza a GET /auth/perfil, la ruta de prueba del Sprint 2, que hacía lo mismo).
  @Post('autorizar')
  @HttpCode(200) // No crea nada, como el login.
  @UseGuards(AuthGuard)
  autorizar(@Req() request: any) {
    // request.user lo cargó el AuthGuard con los datos del token.
    return this.autenticacionService.autorizar(request.user.sub);
  }

  // POST /auth/refrescar → con un token válido, devuelve uno nuevo con el mismo contenido y otros 15 minutos.
  // La usa el modal de "quedan 5 minutos" del front.
  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  refrescar(@Req() request: any) {
    return this.autenticacionService.refrescar(request.user);
  }
}
