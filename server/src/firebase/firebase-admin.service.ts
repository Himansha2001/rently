import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseAdminService {
  constructor(private readonly config: ConfigService) {}

  async verifyIdToken(token: string) {
    try {
      return await this.getAuth().verifyIdToken(token)
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token')
    }
  }

  private getAuth() {
    if (!admin.apps.length) {
      const projectId = this.config.get<string>('FIREBASE_PROJECT_ID')
      const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL')
      const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n')

      if (!projectId || !clientEmail || !privateKey) {
        throw new InternalServerErrorException('Firebase Admin environment variables are not configured')
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    }

    return admin.auth()
  }
}
