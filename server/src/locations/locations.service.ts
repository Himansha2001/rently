import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GeocodeQueryDto } from './dto/geocode-query.dto'

interface NominatimResult {
  lat?: string
  lon?: string
  display_name?: string
}

@Injectable()
export class LocationsService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  async geocode(query: GeocodeQueryDto) {
    const searchText = this.buildSearchText(query)
    if (searchText.length < 5) {
      throw new BadRequestException('Enter more location details before geocoding')
    }

    const endpoint = this.config.get<string>('GEOCODER_BASE_URL') ?? 'https://nominatim.openstreetmap.org/search'
    const userAgent =
      this.config.get<string>('GEOCODER_USER_AGENT') ??
      'Rently Marketplace API development geocoder'
    const url = new URL(endpoint)
    url.searchParams.set('q', searchText)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'lk')
    url.searchParams.set('addressdetails', '0')

    let response: Response
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': userAgent,
        },
      })
    } catch {
      throw new BadGatewayException('Geocoding provider is unavailable')
    }

    if (!response.ok) {
      throw new BadGatewayException('Geocoding provider returned an error')
    }

    const payload: unknown = await response.json()
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new NotFoundException('Location not found')
    }

    const first = payload[0] as NominatimResult
    const latitude = Number(first.lat)
    const longitude = Number(first.lon)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new NotFoundException('Location not found')
    }

    return {
      latitude,
      longitude,
      displayName: first.display_name,
      source: 'nominatim',
    }
  }

  private buildSearchText(query: GeocodeQueryDto) {
    const parts = [
      query.address,
      query.city,
      query.district,
      query.province,
      'Sri Lanka',
    ]
      .map(part => normalizeSearchPart(part))
      .filter(Boolean)

    return Array.from(new Set(parts)).join(', ')
  }
}

function normalizeSearchPart(value?: string) {
  if (!value) return ''

  const withoutControlChars = Array.from(value)
    .map(char => {
      const code = char.charCodeAt(0)
      return code < 32 || code === 127 ? ' ' : char
    })
    .join('')

  return withoutControlChars.replace(/\s+/g, ' ').trim().slice(0, 500)
}
