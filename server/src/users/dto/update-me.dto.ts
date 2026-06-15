import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string
}
