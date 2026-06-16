import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ListingsService } from '../listings/listings.service'
import type { UserDocument } from '../users/user.schema'
import { SavedListing } from './saved-listing.schema'

@Injectable()
export class SavedListingsService {
  constructor(
    @InjectModel(SavedListing.name) private readonly savedListingModel: Model<SavedListing>,
    @Inject(ListingsService)
    private readonly listingsService: ListingsService,
  ) {}

  async list(user: UserDocument) {
    const saved = await this.savedListingModel.find({ userId: user._id }).sort({ createdAt: -1 })
    const listings = await Promise.all(
      saved.map(async item => {
        try {
          return await this.listingsService.findById(item.listingId.toString(), user)
        } catch {
          return null
        }
      }),
    )
    return listings.filter(Boolean)
  }

  async save(user: UserDocument, listingId: string) {
    const listing = await this.listingsService.findListingOrThrow(listingId)
    if (listing.status !== 'approved') throw new NotFoundException('Listing not found')
    await this.savedListingModel.updateOne(
      { userId: user._id, listingId: listing._id },
      { $setOnInsert: { userId: user._id, listingId: listing._id } },
      { upsert: true },
    )
    return { ok: true }
  }

  async remove(user: UserDocument, listingId: string) {
    await this.savedListingModel.deleteOne({ userId: user._id, listingId })
    return { ok: true }
  }
}
