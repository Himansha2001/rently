import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LocationsController } from './locations.controller'
import { LocationsService } from './locations.service'

@Module({
  imports: [ConfigModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
