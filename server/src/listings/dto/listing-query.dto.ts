import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import type { PropertyType } from '../listing.schema'

function toBoolean(value: unknown) {
  if (value === 'true' || value === true || value === '1') return true
  if (value === 'false' || value === false || value === '0') return false
  return value
}

export class ListingQueryDto {
  @IsOptional()
  @IsString()
  query?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsIn(['apartment', 'annex', 'room', 'condo', 'house', 'commercial'])
  propertyType?: PropertyType

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  verified?: boolean

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  featured?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radiusKm?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20
}
