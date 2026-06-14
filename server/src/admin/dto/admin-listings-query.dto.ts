import { IsIn, IsOptional } from 'class-validator'
import type { ListingStatus } from '../../listings/listing.schema'

export class AdminListingsQueryDto {
  @IsOptional()
  @IsIn(['draft', 'pending', 'approved', 'rejected', 'archived'])
  status?: ListingStatus
}
