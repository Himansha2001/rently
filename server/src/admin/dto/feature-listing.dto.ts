import { IsBoolean } from 'class-validator'

export class FeatureListingDto {
  @IsBoolean()
  featured: boolean
}
