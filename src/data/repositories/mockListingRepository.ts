import { MOCK_LISTINGS } from '@/data/mock/listings'
import type { ListingRepository } from '@/data/repositories/listingRepository'
import type { Listing, ListingFilters } from '@/types'

function applyFilters(listings: Listing[], filters?: ListingFilters): Listing[] {
  if (!filters) return listings.filter(l => l.status === 'active')

  return listings.filter(l => {
    if (l.status !== 'active' && !filters.query) return false
    if (filters.query) {
      const q = filters.query.toLowerCase()
      const match =
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
      if (!match) return false
    }
    if (filters.city && l.city !== filters.city) return false
    if (filters.propertyType && filters.propertyType !== 'all' && l.propertyType !== filters.propertyType)
      return false
    if (filters.minPrice != null && l.price < filters.minPrice) return false
    if (filters.maxPrice != null && l.price < Infinity && l.price > filters.maxPrice) return false
    if (filters.minBedrooms != null && l.bedrooms < filters.minBedrooms) return false
    if (filters.verifiedOnly && !l.verified) return false
    return true
  })
}

let listings = [...MOCK_LISTINGS]

export const mockListingRepository: ListingRepository = {
  async getAll(filters) {
    await delay(150)
    return applyFilters(listings, filters)
  },

  async getById(id) {
    await delay(100)
    return listings.find(l => l.id === id) ?? null
  },

  async getFeatured(limit = 6) {
    await delay(100)
    return listings
      .filter(l => l.status === 'active' && l.featured)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  },

  async getByOwner(ownerId) {
    await delay(100)
    return listings.filter(l => l.ownerId === ownerId)
  },

  async create(input, ownerId) {
    await delay(200)
    const listing: Listing = {
      ...input,
      id: String(Date.now()),
      status: 'pending',
      verified: false,
      featured: false,
      views: 0,
      ownerId,
      ownerName: 'You',
      ownerPhone: '+94770000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    listings = [listing, ...listings]
    return listing
  },

  async update(id, input) {
    await delay(150)
    const idx = listings.findIndex(l => l.id === id)
    if (idx === -1) throw new Error('Listing not found')
    listings[idx] = { ...listings[idx], ...input, updatedAt: new Date().toISOString() }
    return listings[idx]
  },

  async delete(id) {
    await delay(100)
    listings = listings.filter(l => l.id !== id)
  },

  async incrementViews(id) {
    const listing = listings.find(l => l.id === id)
    if (listing) listing.views += 1
  },
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
