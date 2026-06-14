import { Module } from '@nestjs/common'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { ListingsModule } from '../listings/listings.module'
import { UsersModule } from '../users/users.module'
import { AdminController } from './admin.controller'

@Module({
  imports: [FirebaseAdminModule, ListingsModule, UsersModule],
  controllers: [AdminController],
})
export class AdminModule {}
