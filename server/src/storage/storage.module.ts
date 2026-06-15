import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { UsersModule } from '../users/users.module'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

@Module({
  imports: [ConfigModule, FirebaseAdminModule, UsersModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
