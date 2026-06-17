import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useListingStore } from '@/store/listingStore'
import { AMENITIES, CITIES, PROPERTY_TYPES, SRI_LANKAN_PROVINCES } from '@/utils/constants'
import type { PropertyType } from '@/types'
import { ApiError, apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

const LocationPicker = lazy(() => import('@/components/map/LocationPicker'))

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum(['apartment', 'annex', 'room', 'condo', 'house', 'commercial']),
  price: z.number().min(5000, 'Minimum rent is Rs. 5,000'),
  address: z.string().min(5),
  city: z.string().min(2),
  district: z.string().min(2),
  province: z.string().min(2, 'Province is required'),
  lat: z.number(),
  lng: z.number(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(1),
  areaSqFt: z.number().optional(),
  contactName: z.string().min(2, 'Contact name is required'),
  contactPhone: z.string().min(7, 'Contact phone is required'),
  contactEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const STEPS = ['Basics', 'Location', 'Photos']

const MAX_LISTING_IMAGES = 10
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

interface GeocodeResult {
  latitude: number
  longitude: number
  displayName?: string
  source?: string
}

type GeocodeMessage = {
  tone: 'success' | 'warning' | 'error'
  text: string
}

function normalizeLocationPart(value?: string) {
  return value?.trim().replace(/\s+/g, ' ') ?? ''
}

function buildLocationSignature(
  address?: string,
  city?: string,
  district?: string,
  province?: string,
) {
  return [address, city, district, province]
    .map(normalizeLocationPart)
    .join('|')
}

function appendParam(params: URLSearchParams, key: string, value?: string) {
  const normalized = normalizeLocationPart(value)
  if (normalized) params.set(key, normalized)
}

export default function CreateListingPage() {
  const [step, setStep] = useState(0)
  const [amenities, setAmenities] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [locationPinned, setLocationPinned] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMessage, setGeocodeMessage] = useState<GeocodeMessage | null>(null)
  const manualPinSignatureRef = useRef<string | null>(null)
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuthStore()
  const { create } = useListingStore()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyType: 'apartment',
      lat: 6.9271,
      lng: 79.8612,
      city: 'Colombo',
      district: 'Colombo',
      province: 'Western Province',
      bedrooms: 2,
      bathrooms: 1,
      contactName: user?.name ?? '',
      contactPhone: user?.phone ?? '',
      contactEmail: user?.email ?? '',
    },
  })
  const pickedLat = useWatch({ control: form.control, name: 'lat' })
  const pickedLng = useWatch({ control: form.control, name: 'lng' })
  const watchedAddress = useWatch({ control: form.control, name: 'address' })
  const watchedCity = useWatch({ control: form.control, name: 'city' })
  const watchedDistrict = useWatch({ control: form.control, name: 'district' })
  const watchedProvince = useWatch({ control: form.control, name: 'province' })
  const currentLocationSignature = buildLocationSignature(
    watchedAddress,
    watchedCity,
    watchedDistrict,
    watchedProvince,
  )

  useEffect(() => {
    const address = normalizeLocationPart(watchedAddress)
    const signature = buildLocationSignature(
      watchedAddress,
      watchedCity,
      watchedDistrict,
      watchedProvince,
    )

    if (address.length < 5) {
      setGeocoding(false)
      setGeocodeMessage(null)
      return
    }

    const params = new URLSearchParams()
    appendParam(params, 'address', watchedAddress)
    appendParam(params, 'city', watchedCity)
    appendParam(params, 'district', watchedDistrict)
    appendParam(params, 'province', watchedProvince)

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setGeocoding(true)
      setGeocodeMessage(null)

      try {
        const result = await apiFetch<GeocodeResult>(`/locations/geocode?${params.toString()}`, {
          signal: controller.signal,
        })

        if (manualPinSignatureRef.current === signature) {
          return
        }

        form.setValue('lat', result.latitude, { shouldDirty: true, shouldValidate: true })
        form.setValue('lng', result.longitude, { shouldDirty: true, shouldValidate: true })
        setLocationPinned(true)
        setGeocodeMessage({
          tone: 'success',
          text: 'Approximate location found. You can adjust the pin manually.',
        })
      } catch (error) {
        if (controller.signal.aborted) return

        setGeocodeMessage({
          tone: error instanceof ApiError && error.status === 404 ? 'warning' : 'error',
          text:
            error instanceof ApiError && error.status === 404
              ? 'No approximate location found. Keep the current pin or adjust it manually.'
              : 'Location lookup is unavailable. You can still pin the property manually.',
        })
      } finally {
        if (!controller.signal.aborted) setGeocoding(false)
      }
    }, 800)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [form, watchedAddress, watchedCity, watchedDistrict, watchedProvince])

  const toggleAmenity = (a: string) => {
    setAmenities(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]))
  }

  const handleLocationChange = (lat: number, lng: number) => {
    manualPinSignatureRef.current = currentLocationSignature
    form.setValue('lat', lat, { shouldDirty: true, shouldValidate: true })
    form.setValue('lng', lng, { shouldDirty: true, shouldValidate: true })
    setLocationPinned(true)
    setGeocodeMessage({
      tone: 'success',
      text: 'Pin updated. Address auto-search will run again if the address fields change.',
    })
  }

  const onImageFilesChange = (files: FileList | null) => {
    const nextFiles = Array.from(files ?? [])
    setPhotoError(null)

    if (nextFiles.length > MAX_LISTING_IMAGES) {
      setPhotoError(`Select up to ${MAX_LISTING_IMAGES} images.`)
      return
    }
    const invalidType = nextFiles.find(file => !ALLOWED_IMAGE_TYPES.includes(file.type))
    if (invalidType) {
      setPhotoError('Only JPEG, PNG, WebP, and AVIF images are allowed.')
      return
    }
    const tooLarge = nextFiles.find(file => file.size > MAX_IMAGE_SIZE_BYTES)
    if (tooLarge) {
      setPhotoError('Each image must be 5MB or smaller.')
      return
    }

    setImageFiles(nextFiles)
  }

  const uploadListingImages = async () => {
    const body = new FormData()
    imageFiles.forEach(file => body.append('images', file))
    const response = await apiFetch<{ imageUrls: string[] }>('/uploads/listing-images', {
      method: 'POST',
      auth: true,
      body,
    })
    return response.imageUrls
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    if (!locationPinned) {
      form.setError('lat', { message: 'Pin the property location on the map before submitting.' })
      setStep(1)
      return
    }
    if (!imageFiles.length) {
      setPhotoError('Add at least one real property photo before submitting.')
      setStep(2)
      return
    }

    setUploadingImages(true)
    setPhotoError(null)
    try {
      const imageUrls = await uploadListingImages()
      await create(
        {
          ...data,
          propertyType: data.propertyType as PropertyType,
          amenities,
          images: imageUrls,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail || user.email,
        },
        user.id,
      )
      await refreshProfile()
      setSubmitted(true)
      setTimeout(() => navigate('/account?tab=listings'), 2000)
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Image upload failed. Try again.')
      setStep(2)
    } finally {
      setUploadingImages(false)
    }
  }

  const nextStep = async () => {
    const fields: (keyof FormData)[][] = [
      [
        'title',
        'description',
        'propertyType',
        'price',
        'bedrooms',
        'bathrooms',
        'areaSqFt',
        'contactName',
        'contactPhone',
        'contactEmail',
      ],
      ['address', 'city', 'district', 'province', 'lat', 'lng'],
      [],
    ]
    const valid = await form.trigger(fields[step])
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  if (submitted) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Listing submitted!</h2>
          <p className="text-stone-600">Your listing is pending admin approval.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">List your property</h1>
        <p className="text-stone-600 mb-8">Complete all steps to publish on Rently</p>

        <div className="flex gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  'h-1 rounded-full mb-2 transition-colors',
                  i <= step ? 'bg-primary-600' : 'bg-stone-200',
                )}
              />
              <span className={cn('text-xs font-medium', i <= step ? 'text-primary-700' : 'text-stone-400')}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Property details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" {...form.register('title')} placeholder="e.g. Modern 2BR in Colombo 7" />
                      {form.formState.errors.title && (
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        {...form.register('description')}
                        rows={4}
                        className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Describe your property..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <select
                          {...form.register('propertyType')}
                          className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm"
                        >
                          {PROPERTY_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="price">Monthly rent (LKR)</Label>
                        <Input id="price" type="number" {...form.register('price', { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input id="bedrooms" type="number" {...form.register('bedrooms', { valueAsNumber: true })} />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input id="bathrooms" type="number" {...form.register('bathrooms', { valueAsNumber: true })} />
                      </div>
                      <div>
                        <Label htmlFor="areaSqFt">Sq ft (optional)</Label>
                        <Input id="areaSqFt" type="number" {...form.register('areaSqFt', { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div>
                      <Label>Amenities</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AMENITIES.map(a => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => toggleAmenity(a)}
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                              amenities.includes(a)
                                ? 'bg-primary-100 border-primary-300 text-primary-800'
                                : 'border-stone-200 text-stone-600 hover:border-primary-300',
                            )}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactName">Contact name</Label>
                        <Input id="contactName" {...form.register('contactName')} />
                        {form.formState.errors.contactName && (
                          <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Contact phone</Label>
                        <Input id="contactPhone" {...form.register('contactPhone')} placeholder="+94 77 123 4567" />
                        {form.formState.errors.contactPhone && (
                          <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactPhone.message}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="contactEmail">Contact email</Label>
                        <Input id="contactEmail" type="email" {...form.register('contactEmail')} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" {...form.register('address')} />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <select
                          id="city"
                          {...form.register('city')}
                          className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm"
                        >
                          {CITIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="district">District</Label>
                        <Input id="district" {...form.register('district')} />
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <select
                          id="province"
                          {...form.register('province')}
                          className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm"
                        >
                          {SRI_LANKAN_PROVINCES.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        {form.formState.errors.province && (
                          <p className="text-red-500 text-xs mt-1">{form.formState.errors.province.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Pin on map (click or drag to set location)</Label>
                      <Suspense fallback={<div className="h-64 bg-stone-200 rounded-xl animate-pulse" />}>
                        <LocationPicker
                          lat={pickedLat}
                          lng={pickedLng}
                          onChange={handleLocationChange}
                        />
                      </Suspense>
                      {geocoding && (
                        <p className="text-primary-700 text-sm mt-2">
                          Finding an approximate location from the address...
                        </p>
                      )}
                      {geocodeMessage && (
                        <p
                          className={cn(
                            'text-sm mt-2',
                            geocodeMessage.tone === 'success' && 'text-emerald-700',
                            geocodeMessage.tone === 'warning' && 'text-amber-700',
                            geocodeMessage.tone === 'error' && 'text-red-600',
                          )}
                        >
                          {geocodeMessage.text}
                        </p>
                      )}
                      {!locationPinned && (
                        <p className="text-amber-700 text-sm mt-2">
                          Click the map to confirm the exact property location.
                        </p>
                      )}
                      {form.formState.errors.lat && (
                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.lat.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center">
                      <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                      <p className="text-stone-600 font-medium mb-1">Upload property photos</p>
                      <p className="text-stone-400 text-sm mb-4">
                        Add up to 10 JPEG, PNG, WebP, or AVIF images. Max 5MB each.
                      </p>
                      <Input
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        multiple
                        onChange={event => onImageFilesChange(event.target.files)}
                        className="max-w-sm mx-auto bg-white"
                      />
                      {imageFiles.length > 0 && (
                        <div className="mt-5 text-left max-w-sm mx-auto space-y-2">
                          <p className="text-sm font-medium text-stone-700">
                            {imageFiles.length} image{imageFiles.length === 1 ? '' : 's'} selected
                          </p>
                          <ul className="space-y-1 text-xs text-stone-500">
                            {imageFiles.map(file => (
                              <li key={`${file.name}-${file.size}`} className="truncate">
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {photoError && <p className="text-red-500 text-sm mt-4">{photoError}</p>}
                      {uploadingImages && (
                        <p className="text-primary-700 text-sm mt-4">Uploading photos...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" variant="accent" disabled={uploadingImages}>
                {uploadingImages ? 'Uploading...' : 'Publish listing'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
