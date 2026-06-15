import { Module } from '@nestjs/common'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { UsersModule } from '../users/users.module'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

@Module({
  imports: [FirebaseAdminModule, UsersModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
