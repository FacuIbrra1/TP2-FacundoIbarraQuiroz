import { Body, Controller, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsuariosService } from './usuarios.service.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';

// Corrección del Sprint 3: el usuario edita su perfil.
// (En el Sprint 4 se suman acá las rutas del administrador: listar, crear, deshabilitar y rehabilitar).
@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // PATCH /usuarios/mi-perfil → cambia los datos del usuario del token. La foto nueva es opcional,
  // como la imagen de una publicación: FileInterceptor con memoryStorage y hasta 2 MB (si no, 413).
  @Patch('mi-perfil')
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }))
  editarMiPerfil(@Body() updatePerfilDto: UpdatePerfilDto, @UploadedFile() imagen: Express.Multer.File | undefined, @Req() request: any) {
    return this.usuariosService.editarPerfil(request.user.sub, updatePerfilDto, imagen);
  }
}
