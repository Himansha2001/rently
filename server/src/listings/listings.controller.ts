import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { FirebaseAuthGuard, OptionalFirebaseAuthGuard } from '../common/guards/firebase-auth.guard'
import type { UserDocument } from '../users/user.schema'
import { CreateListingDto } from './dto/create-listing.dto'
import { ListingQueryDto } from './dto/listing-query.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { ListingsService } from './listings.service'

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @UseGuards(OptionalFirebaseAuthGuard)
  search(@Query() query: ListingQueryDto, @CurrentUser() user?: UserDocument) {
    return this.listingsService.search(query, user)
  }

  @Get('mine')
  @UseGuards(FirebaseAuthGuard)
  mine(@CurrentUser() user: UserDocument) {
    return this.listingsService.findMine(user)
  }

  @Get(':id')
  @UseGuards(OptionalFirebaseAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user?: UserDocument) {
    return this.listingsService.findById(id, user)
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user, dto)
  }

  @Post(':id/view')
  incrementViews(@Param('id') id: string) {
    return this.listingsService.incrementViews(id)
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, user, dto)
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  archive(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.listingsService.archiveOwned(id, user)
  }
}
