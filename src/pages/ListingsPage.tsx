import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Map, Grid3X3 } from 'lucide-react'
import FilterBar from '@/components/listings/FilterBar'
import ListingCard from '@/components/listings/ListingCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useListingStore } from '@/store/listingStore'
import { useListingFiltersFromUrl } from '@/hooks/useListingFiltersFromUrl'
import type { ListingFilters } from '@/types'
import { cn } from '@/lib/utils'

const ListingsMap = lazy(() => import('@/components/listings/ListingsMap'))

export default function ListingsPage() {
  const urlFilters = useListingFiltersFromUrl()
  const [, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ListingFilters>(urlFilters)
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const { listings, loading, fetchAll } = useListingStore()

  useEffect(() => {
    setFilters(urlFilters)
  }, [urlFilters])

  useEffect(() => {
    fetchAll(filters)
  }, [filters, fetchAll])

  const handleFilterChange = useCallback(
    (next: ListingFilters) => {
      setFilters(next)
      const params = new URLSearchParams()
      if (next.query) params.set('q', next.query)
      if (next.city) params.set('city', next.city)
      if (next.propertyType) params.set('type', next.propertyType)
      if (next.minPrice) params.set('minPrice', String(next.minPrice))
      if (next.maxPrice) params.set('maxPrice', String(next.maxPrice))
      if (next.minBedrooms) params.set('beds', String(next.minBedrooms))
      if (next.verifiedOnly) params.set('verified', '1')
      setSearchParams(params, { replace: true })
    },
    [setSearchParams],
  )

  return (
    <div className="pt-20 min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900">
            Browse rentals
          </h1>
          <p className="text-stone-600 mt-2">Discover properties across Sri Lanka</p>
        </div>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} resultCount={listings.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
            Grid
          </Button>
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('map')}
          >
            <Map className="w-4 h-4" />
            Map
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : view === 'map' ? (
          <Suspense
            fallback={
              <div className="h-[500px] rounded-2xl bg-stone-200 animate-pulse flex items-center justify-center text-stone-500">
                Loading map...
              </div>
            }
          >
            <ListingsMap
              listings={listings}
              className="h-[min(560px,calc(100dvh-22rem))] min-h-[400px] mb-8"
            />
          </Suspense>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-600 text-lg">No properties match your filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => handleFilterChange({})}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              view === 'grid' && 'sm:grid-cols-2 lg:grid-cols-3',
            )}
          >
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
