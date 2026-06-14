import { apiFetch } from '@/lib/api'
import type { Listing, ListingFilters } from '@/types'
import type { ListingRepository } from '@/data/repositories/listingRepository'

interface ListingListResponse {
  items: BackendListing[]
  page: number
  limit: number
  total: number
}

interface BackendListing {
  id: string
  ownerId: string
  title: string
  description: string
  propertyType: Listing['propertyType']
  price: number
  currency?: string
  address: string
  city: string
  district: string
  province?: string
  lat: number
  lng: number
  distanceKm?: number
  bedrooms: number
  bathrooms: number
  areaSqFt?: number
  amenities?: string[]
  images?: string[]
  imageUrls?: string[]
  status: Listing['status']
  isVerified?: boolean
  isFeatured?: boolean
  verified?: boolean
  featured?: boolean
  views?: number
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  ownerName?: string
  ownerPhone?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
}

function mapListing(listing: BackendListing): Listing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    propertyType: listing.propertyType,
    price: listing.price,
    currency: listing.currency,
    address: listing.address,
    city: listing.city,
    district: listing.district,
    province: listing.province,
    lat: listing.lat,
    lng: listing.lng,
    distanceKm: listing.distanceKm,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    areaSqFt: listing.areaSqFt,
    amenities: listing.amenities ?? [],
    images: listing.images ?? listing.imageUrls ?? [],
    status: listing.status,
    verified: listing.verified ?? listing.isVerified ?? false,
    featured: listing.featured ?? listing.isFeatured ?? false,
    views: listing.views ?? 0,
    ownerId: listing.ownerId,
    ownerName: listing.ownerName ?? listing.contactName ?? 'Landlord',
    ownerPhone: listing.ownerPhone ?? listing.contactPhone,
    contactName: listing.contactName,
    contactPhone: listing.contactPhone,
    contactEmail: listing.contactEmail,
    rejectionReason: listing.rejectionReason,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    approvedAt: listing.approvedAt,
  }
}

function buildParams(filters?: ListingFilters) {
  const params = new URLSearchParams()
  if (!filters) return params
  if (filters.query) params.set('query', filters.query)
  if (filters.city) params.set('city', filters.city)
  if (filters.propertyType && filters.propertyType !== 'all') params.set('propertyType', filters.propertyType)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.minBedrooms != null) params.set('bedrooms', String(filters.minBedrooms))
  if (filters.minBathrooms != null) params.set('bathrooms', String(filters.minBathrooms))
  if (filters.verifiedOnly) params.set('verified', 'true')
  if (filters.featuredOnly) params.set('featured', 'true')
  if (filters.lat != null) params.set('lat', String(filters.lat))
  if (filters.lng != null) params.set('lng', String(filters.lng))
  if (filters.radiusKm != null) params.set('radiusKm', String(filters.radiusKm))
  params.set('limit', '30')
  return params
}

export const backendListingRepository: ListingRepository = {
  async getAll(filters) {
    const params = buildParams(filters)
    const data = await apiFetch<ListingListResponse>(`/listings?${params.toString()}`)
    return data.items.map(mapListing)
  },

  async getById(id) {
    const listing = await apiFetch<BackendListing>(`/listings/${id}`)
    return mapListing(listing)
  },

  async getFeatured(limit = 6) {
    const params = new URLSearchParams({ featured: 'true', limit: String(limit) })
    const data = await apiFetch<ListingListResponse>(`/listings?${params.toString()}`)
    return data.items.map(mapListing)
  },

  async getByOwner() {
    const listings = await apiFetch<BackendListing[]>('/listings/mine', { auth: true })
    return listings.map(mapListing)
  },

  async create(input) {
    const listing = await apiFetch<BackendListing>('/listings', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({
        ...input,
        imageUrls: input.images,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
      }),
    })
    return mapListing(listing)
  },

  async update(id, input) {
    const listing = await apiFetch<BackendListing>(`/listings/${id}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({
        ...input,
        imageUrls: input.images,
      }),
    })
    return mapListing(listing)
  },

  async delete(id) {
    await apiFetch(`/listings/${id}`, { method: 'DELETE', auth: true })
  },

  async incrementViews(id) {
    await apiFetch(`/listings/${id}/view`, { method: 'POST' })
  },
}
