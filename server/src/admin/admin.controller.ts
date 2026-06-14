import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { ListingsService } from '../listings/listings.service'
import type { UserDocument } from '../users/user.schema'
import { AdminListingsQueryDto } from './dto/admin-listings-query.dto'
import { FeatureListingDto } from './dto/feature-listing.dto'
import { RejectListingDto } from './dto/reject-listing.dto'

@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get('listings')
  async listings(@Query() query: AdminListingsQueryDto, @CurrentUser() user: UserDocument) {
    const listings = await this.listingsService.findForAdmin(query.status ?? 'pending')
    return listings.map(listing =>
      this.listingsService.toResponse(listing, user, { includeSensitive: true, admin: true }),
    )
  }

  @Patch('listings/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.listingsService.approve(id, user)
  }

  @Patch('listings/:id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: RejectListingDto,
  ) {
    return this.listingsService.reject(id, user, dto.reason)
  }

  @Patch('listings/:id/feature')
  feature(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: FeatureListingDto,
  ) {
    return this.listingsService.feature(id, user, dto.featured)
  }

  @Patch('listings/:id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.listingsService.archiveByAdmin(id, user)
  }
}
