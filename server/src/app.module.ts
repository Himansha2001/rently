import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ListingsModule } from './listings/listings.module'
import { AdminModule } from './admin/admin.module'
import { MessagingModule } from './messaging/messaging.module'
import { SavedListingsModule } from './saved-listings/saved-listings.module'
import { StorageModule } from './storage/storage.module'
import { LocationsModule } from './locations/locations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        autoIndex: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    UsersModule,
    AuthModule,
    ListingsModule,
    AdminModule,
    MessagingModule,
    SavedListingsModule,
    StorageModule,
    LocationsModule,
  ],
})
export class AppModule {}
