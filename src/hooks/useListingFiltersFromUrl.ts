import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ListingFilters, PropertyType } from '@/types'

export function useListingFiltersFromUrl(): ListingFilters {
  const [params] = useSearchParams()

  return useMemo(() => {
    const type = params.get('type')
    return {
      query: params.get('q') ?? undefined,
      city: params.get('city') ?? undefined,
      propertyType: type ? (type as PropertyType) : undefined,
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      minBedrooms: params.get('beds') ? Number(params.get('beds')) : undefined,
      verifiedOnly: params.get('verified') === '1',
    }
  }, [params])
}
