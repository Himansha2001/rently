export type PropertyType =
  | 'apartment'
  | 'annex'
  | 'room'
  | 'condo'
  | 'house'
  | 'commercial'

export type ListingStatus =
  | 'active'
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'rented'

export type UserRole = 'user' | 'landlord' | 'admin'

export interface Listing {
  id: string
  title: string
  description: string
  propertyType: PropertyType
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
  amenities: string[]
  images: string[]
  status: ListingStatus
  verified: boolean
  featured: boolean
  views: number
  ownerId: string
  ownerName: string
  ownerPhone?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  approvedAt?: string
}

/** Users can rent and list — preferences only affect dashboard defaults */
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  /** @deprecated use isRenter / isLandlord */
  role?: 'tenant' | 'landlord' | 'admin'
  roles?: UserRole[]
  isRenter: boolean
  isLandlord: boolean
  isEmailVerified?: boolean
  status?: 'active' | 'suspended' | 'deleted'
}

export interface Conversation {
  id: string
  listingId: string
  listingTitle: string
  listingImage: string
  participantIds: [string, string]
  participantNames: Record<string, string>
  lastMessage: string
  lastMessageAt: string
  unreadBy: Record<string, number>
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

export type AccountTab = 'overview' | 'messages' | 'listings' | 'saved' | 'profile'

export interface ListingFilters {
  query?: string
  city?: string
  propertyType?: PropertyType | 'all'
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  verifiedOnly?: boolean
  featuredOnly?: boolean
  lat?: number
  lng?: number
  radiusKm?: number
}

export interface CreateListingInput {
  title: string
  description: string
  propertyType: PropertyType
  price: number
  currency?: string
  address: string
  city: string
  district: string
  province?: string
  lat: number
  lng: number
  bedrooms: number
  bathrooms: number
  areaSqFt?: number
  amenities: string[]
  images: string[]
  contactName?: string
  contactPhone?: string
  contactEmail?: string
}
