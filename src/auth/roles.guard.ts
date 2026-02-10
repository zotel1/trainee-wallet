import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleName } from './roles.decorator';

type JwtUser = { userId: string; email: string; role: RoleName };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no pide roles, no bloqueamos nada
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const user = req.user;

    // Si llegamos acá y no hay user, en teoria el JwtAuthGuard no corrió.
    // Para evitar accesos raros, lo consideramos forbidden.
    if (!user) throw new ForbiddenException('Missibg user ub request');

    const allowed = requiredRoles.includes(user.role);
    if (!allowed) throw new ForbiddenException('Insufficient role');

    return true;
  }
}
