import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { UsersModule } from '../users/users.module'
import { Listing, ListingSchema } from './listing.schema'
import { ListingsController } from './listings.controller'
import { ListingsService } from './listings.service'

@Module({
  imports: [
    FirebaseAdminModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
