import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import type { PropertyType } from '../listing.schema'

export class CreateListingDto {
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  title: string

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string

  @IsIn(['apartment', 'annex', 'room', 'condo', 'house', 'commercial'])
  propertyType: PropertyType

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address: string

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city: string

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  district: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string

  @Type(() => Number)
  @IsLatitude()
  lat: number

  @Type(() => Number)
  @IsLongitude()
  lng: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  bedrooms: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  bathrooms: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  areaSqFt?: number

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  amenities?: string[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl({}, { each: true })
  imageUrls?: string[]

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  contactName: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  contactPhone?: string

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  contactEmail?: string
}
