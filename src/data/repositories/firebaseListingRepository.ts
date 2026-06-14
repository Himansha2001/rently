import type { ListingRepository } from '@/data/repositories/listingRepository'

/**
 * Legacy placeholder retained only to avoid breaking old imports.
 * Rently uses Firebase Authentication only. Do not implement listing data with
 * Firestore, Firebase Storage, Realtime Database, or Cloud Functions.
 * Production listing data lives behind the NestJS/MongoDB API repository.
 */
export const firebaseListingRepository: ListingRepository = {
  async getAll() {
    throw new Error('Firebase listing data is not supported. Use backendListingRepository.')
  },
  async getById() {
    throw new Error('Firebase not configured.')
  },
  async getFeatured() {
    throw new Error('Firebase not configured.')
  },
  async getByOwner() {
    throw new Error('Firebase not configured.')
  },
  async create() {
    throw new Error('Firebase not configured.')
  },
  async update() {
    throw new Error('Firebase not configured.')
  },
  async delete() {
    throw new Error('Firebase not configured.')
  },
  async incrementViews() {
    throw new Error('Firebase not configured.')
  },
}
