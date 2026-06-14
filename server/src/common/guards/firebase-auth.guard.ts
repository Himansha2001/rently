import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { FirebaseAdminService } from '../../firebase/firebase-admin.service'
import { UsersService } from '../../users/users.service'
import type { RequestWithUser } from '../types/request-with-user'

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const header = request.headers.authorization
    const token = extractBearerToken(header)

    if (!token) {
      throw new UnauthorizedException('Missing Authorization bearer token')
    }

    const decoded = await this.firebaseAdmin.verifyIdToken(token)
    request.user = await this.usersService.upsertFromFirebaseToken(decoded)
    return true
  }
}

@Injectable()
export class OptionalFirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const token = extractBearerToken(request.headers.authorization)

    if (!token) return true

    const decoded = await this.firebaseAdmin.verifyIdToken(token)
    request.user = await this.usersService.upsertFromFirebaseToken(decoded)
    return true
  }
}

function extractBearerToken(header?: string) {
  if (!header) return null
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}
