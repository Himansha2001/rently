import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CITIES, PROPERTY_TYPES, PRICE_RANGES } from '@/utils/constants'
import type { ListingFilters, PropertyType } from '@/types'

interface FilterBarProps {
  filters: ListingFilters
  onChange: (filters: ListingFilters) => void
  resultCount: number
}

export default function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const setPriceRange = (idx: number) => {
    const range = PRICE_RANGES[idx]
    onChange({
      ...filters,
      minPrice: range.min > 0 ? range.min : undefined,
      maxPrice: range.max < Infinity ? range.max : undefined,
    })
  }

  const clearFilters = () => onChange({})

  const hasFilters =
    filters.query ||
    filters.city ||
    (filters.propertyType && filters.propertyType !== 'all') ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minBedrooms ||
    filters.verifiedOnly

  return (
    <div className="sticky top-[72px] z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={filters.query ?? ''}
              onChange={e => onChange({ ...filters, query: e.target.value || undefined })}
              placeholder="Search listings..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1 text-stone-500 text-sm mr-1">
              <SlidersHorizontal className="w-4 h-4" />
            </div>

            <select
              value={filters.city ?? ''}
              onChange={e => onChange({ ...filters, city: e.target.value || undefined })}
              className="h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm"
            >
              <option value="">All cities</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filters.propertyType ?? 'all'}
              onChange={e =>
                onChange({
                  ...filters,
                  propertyType:
                    e.target.value === 'all' ? undefined : (e.target.value as PropertyType),
                })
              }
              className="h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm"
            >
              <option value="all">All types</option>
              {PROPERTY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              onChange={e => setPriceRange(Number(e.target.value))}
              className="h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm"
              defaultValue=""
            >
              <option value="" disabled>Price range</option>
              {PRICE_RANGES.map((r, i) => (
                <option key={r.label} value={i}>{r.label}</option>
              ))}
            </select>

            <select
              value={filters.minBedrooms ?? ''}
              onChange={e =>
                onChange({
                  ...filters,
                  minBedrooms: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm"
            >
              <option value="">Beds</option>
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}+ beds</option>
              ))}
            </select>

            <label className="flex items-center gap-2 h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly ?? false}
                onChange={e => onChange({ ...filters, verifiedOnly: e.target.checked || undefined })}
                className="rounded border-stone-300 text-primary-600 focus:ring-primary-500"
              />
              Verified
            </label>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-stone-500 mt-3">
          {resultCount} {resultCount === 1 ? 'property' : 'properties'} found
        </p>
      </div>
    </div>
  )
}
