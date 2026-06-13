import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
import { AMENITIES, CITIES, PROPERTY_TYPES } from '@/utils/constants'
import type { PropertyType } from '@/types'
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
  lat: z.number(),
  lng: z.number(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(1),
  areaSqFt: z.number().optional(),
})

type FormData = z.infer<typeof schema>

const STEPS = ['Basics', 'Location', 'Photos']

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-24aafb2f6c5c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c45772?auto=format&fit=crop&w=800&q=80',
]

export default function CreateListingPage() {
  const [step, setStep] = useState(0)
  const [amenities, setAmenities] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { create } = useListingStore()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyType: 'apartment',
      lat: 6.9271,
      lng: 79.8612,
      city: 'Colombo',
      district: 'Colombo',
      bedrooms: 2,
      bathrooms: 1,
    },
  })

  const toggleAmenity = (a: string) => {
    setAmenities(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]))
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    await create(
      {
        ...data,
        propertyType: data.propertyType as PropertyType,
        amenities,
        images: PLACEHOLDER_IMAGES,
      },
      user.id,
    )
    setSubmitted(true)
    setTimeout(() => navigate('/account?tab=listings'), 2000)
  }

  const nextStep = async () => {
    const fields: (keyof FormData)[][] = [
      ['title', 'description', 'propertyType', 'price', 'bedrooms', 'bathrooms', 'areaSqFt'],
      ['address', 'city', 'district', 'lat', 'lng'],
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
          <p className="text-stone-600">Redirecting to your dashboard...</p>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <select
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
                    </div>
                    <div>
                      <Label>Pin on map (click to set location)</Label>
                      <Suspense fallback={<div className="h-64 bg-stone-200 rounded-xl animate-pulse" />}>
                        <LocationPicker
                          lat={form.watch('lat')}
                          lng={form.watch('lng')}
                          onChange={(lat, lng) => {
                            form.setValue('lat', lat)
                            form.setValue('lng', lng)
                          }}
                        />
                      </Suspense>
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
                      <p className="text-stone-600 font-medium mb-1">Drag & drop photos here</p>
                      <p className="text-stone-400 text-sm mb-4">
                        Demo mode uses placeholder images. Firebase Storage in phase 2.
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                        {PLACEHOLDER_IMAGES.map(img => (
                          <img key={img} src={img} alt="" className="rounded-lg aspect-video object-cover" />
                        ))}
                      </div>
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
              <Button type="submit" variant="accent">
                Publish listing
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
