import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { UserRole } from '../../users/user.schema'
import type { RequestWithUser } from '../types/request-with-user'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles?.length) return true

    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const user = request.user
    if (!user) throw new ForbiddenException('Authentication required')

    const allowed = roles.some(role => user.roles.includes(role))
    if (!allowed) throw new ForbiddenException('Insufficient role')

    return true
  }
}
