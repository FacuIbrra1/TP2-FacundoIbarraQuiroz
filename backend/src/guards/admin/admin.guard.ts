import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Sprint 4: "Se debe validar que el token pertenezca a un administrador".
// Va SIEMPRE después del AuthGuard: el AuthGuard valida el token y deja sus datos en request.user;
// este guard solo mira el perfil que viene adentro del token.
//   @UseGuards(AuthGuard, AdminGuard) → los guards se ejecutan en ese orden.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 403 y no 401: el token es válido (sabemos quién es), pero no tiene permiso para esto.
    if (request.user.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto');
    }

    return true;
  }
}
