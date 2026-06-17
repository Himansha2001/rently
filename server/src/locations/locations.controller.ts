import { Controller, Get, Inject, Query } from '@nestjs/common'
import { GeocodeQueryDto } from './dto/geocode-query.dto'
import { LocationsService } from './locations.service'

@Controller('locations')
export class LocationsController {
  constructor(@Inject(LocationsService) private readonly locationsService: LocationsService) {}

  @Get('geocode')
  geocode(@Query() query: GeocodeQueryDto) {
    return this.locationsService.geocode(query)
  }
}
