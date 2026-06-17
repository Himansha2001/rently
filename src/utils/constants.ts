import type { PropertyType } from '@/types'

export const CITIES = [
  'Colombo',
  'Colombo 3',
  'Colombo 5',
  'Colombo 7',
  'Kandy',
  'Galle',
  'Negombo',
  'Jaffna',
  'Matara',
  'Nugegoda',
  'Dehiwala',
  'Battaramulla',
] as const

export const SRI_LANKAN_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
] as const

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'annex', label: 'Annex' },
  { value: 'room', label: 'Room' },
  { value: 'condo', label: 'Condo' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
]

export const AMENITIES = [
  'Parking',
  'A/C',
  'WiFi',
  'Security',
  'Furnished',
  'Garden',
  'Balcony',
  'Water',
  'Generator',
  'Pet Friendly',
] as const

export const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under Rs. 25k', min: 0, max: 25000 },
  { label: 'Rs. 25k – 50k', min: 25000, max: 50000 },
  { label: 'Rs. 50k – 100k', min: 50000, max: 100000 },
  { label: 'Rs. 100k+', min: 100000, max: Infinity },
] as const
