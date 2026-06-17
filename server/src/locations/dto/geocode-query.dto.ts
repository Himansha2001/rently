import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GeocodeQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  district?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string
}
