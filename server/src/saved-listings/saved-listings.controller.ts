import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard'
import type { UserDocument } from '../users/user.schema'
import { SavedListingsService } from './saved-listings.service'

@Controller('me/saved-listings')
@UseGuards(FirebaseAuthGuard)
export class SavedListingsController {
  constructor(private readonly savedListingsService: SavedListingsService) {}

  @Get()
  list(@CurrentUser() user: UserDocument) {
    return this.savedListingsService.list(user)
  }

  @Post(':listingId')
  save(@CurrentUser() user: UserDocument, @Param('listingId') listingId: string) {
    return this.savedListingsService.save(user, listingId)
  }

  @Delete(':listingId')
  remove(@CurrentUser() user: UserDocument, @Param('listingId') listingId: string) {
    return this.savedListingsService.remove(user, listingId)
  }
}
