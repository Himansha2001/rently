import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FirebaseAdminModule } from '../firebase/firebase-admin.module'
import { ListingsModule } from '../listings/listings.module'
import { UsersModule } from '../users/users.module'
import { SavedListing, SavedListingSchema } from './saved-listing.schema'
import { SavedListingsController } from './saved-listings.controller'
import { SavedListingsService } from './saved-listings.service'

@Module({
  imports: [
    FirebaseAdminModule,
    UsersModule,
    ListingsModule,
    MongooseModule.forFeature([{ name: SavedListing.name, schema: SavedListingSchema }]),
  ],
  controllers: [SavedListingsController],
  providers: [SavedListingsService],
})
export class SavedListingsModule {}
