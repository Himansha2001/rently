import type { ListingRepository } from '@/data/repositories/listingRepository'

/**
 * Phase 2: Firebase Firestore implementation.
 * Replace mockListingRepository in src/data/index.ts when Firebase is configured.
 *
 * Setup checklist:
 * 1. npm install firebase
 * 2. firebase init (Firestore, Storage, Auth, Hosting)
 * 3. Add VITE_FIREBASE_* env vars to .env.local
 * 4. Implement CRUD against listings/{listingId} collection
 * 5. Upload images to Cloud Storage, store URLs in listing doc
 */
export const firebaseListingRepository: ListingRepository = {
  async getAll() {
    throw new Error('Firebase not configured. Use mockListingRepository in phase 1.')
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
