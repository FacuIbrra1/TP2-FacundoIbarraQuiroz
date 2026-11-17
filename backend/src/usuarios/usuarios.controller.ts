import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { memoryStorage } from 'multer';
import { Types } from 'mongoose';
import { UsuariosService } from './usuarios.service.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { CreateUsuarioAdminDto } from './dto/create-usuario-admin.dto.js';
import { AuthGuard } from '../guards/auth/auth.guard.js';
import { AdminGuard } from '../guards/admin/admin.guard.js';

// El "usuarios controller" del enunciado.
// @UseGuards(AuthGuard) en la clase: TODAS las rutas piden el token.
// Las del administrador (Sprint 4) suman AdminGuard: si el token no es de un administrador, 403.
// Los guards de la clase se ejecutan antes que los de cada ruta.
@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // ---- Corrección del Sprint 3: el usuario edita su perfil ----

  // PATCH /usuarios/mi-perfil → cambia los datos del usuario del token. La foto nueva es opcional,
  // como la imagen de una publicación: FileInterceptor con memoryStorage y hasta 2 MB (si no, 413).
  @Patch('mi-perfil')
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }))
  editarMiPerfil(@Body() updatePerfilDto: UpdatePerfilDto, @UploadedFile() imagen: Express.Multer.File | undefined, @Req() request: any) {
    return this.usuariosService.editarPerfil(request.user.sub, updatePerfilDto, imagen);
  }

  // ---- Sprint 4: solo administradores ----

  // GET /usuarios → el listado de todos los usuarios.
  @Get()
  @UseGuards(AdminGuard)
  listar() {
    return this.usuariosService.listar();
  }

  // POST /usuarios → alta de un usuario nuevo con los mismos datos que el registro, más el perfil.
  // multipart/form-data por la imagen, igual que POST /auth/registro. Responde 201 con el usuario (sin token:
  // el administrador sigue con su propia sesión).
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }))
  async crear(@Body() createUsuarioAdminDto: CreateUsuarioAdminDto, @UploadedFile() imagen: Express.Multer.File) {
    const nuevoUsuario = await this.usuariosService.crear(createUsuarioAdminDto, imagen, createUsuarioAdminDto.perfil);
    return await this.usuariosService.buscarPorId(nuevoUsuario._id); // Sin la contraseña.
  }

  // DELETE /usuarios/:id → baja lógica: deshabilita la cuenta.
  @Delete(':id')
  @UseGuards(AdminGuard)
  deshabilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: any) {
    return this.usuariosService.deshabilitar(id, request.user.sub);
  }

  // POST /usuarios/:id/habilitar → alta lógica: la cuenta vuelve a poder ingresar.
  @Post(':id/habilitar')
  @HttpCode(200) // No crea nada: cambia el estado de un usuario que ya existe.
  @UseGuards(AdminGuard)
  habilitar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.usuariosService.habilitar(id);
  }
}
