import type { CreateListingInput, Listing, ListingFilters } from '@/types'

export interface ListingRepository {
  getAll(filters?: ListingFilters): Promise<Listing[]>
  getById(id: string): Promise<Listing | null>
  getFeatured(limit?: number): Promise<Listing[]>
  getByOwner(ownerId: string): Promise<Listing[]>
  create(input: CreateListingInput, ownerId: string): Promise<Listing>
  update(id: string, input: Partial<CreateListingInput>): Promise<Listing>
  delete(id: string): Promise<void>
  incrementViews(id: string): Promise<void>
}
