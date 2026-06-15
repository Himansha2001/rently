import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import type { ListingStatus } from '../../listings/listing.schema'

export class AdminListingsQueryDto {
  @IsOptional()
  @IsIn(['draft', 'pending', 'approved', 'rejected', 'archived'])
  status?: ListingStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}
