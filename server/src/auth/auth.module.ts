import { Module } from '@nestjs/common'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'

@Module({
  imports: [FirebaseAdminModule, UsersModule],
  controllers: [AuthController],
})
export class AuthModule {}
