import { lazy, Suspense, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Bed,
  Bath,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Heart,
  ArrowLeft,
  Maximize,
  BadgeCheck,
} from 'lucide-react'
import ListingGallery from '@/components/listings/ListingGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useListingStore } from '@/store/listingStore'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { useSavedStore } from '@/store/savedStore'
import { formatLKRMonthly } from '@/lib/format'
import { PROPERTY_TYPES } from '@/utils/constants'

const ListingsMap = lazy(() => import('@/components/listings/ListingsMap'))

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { current, loading, fetchById, clearCurrent } = useListingStore()
  const { user, isAuthenticated } = useAuthStore()
  const openConversation = useMessageStore(s => s.openConversationForListing)
  const toggleSaved = useSavedStore(s => s.toggle)
  const isSaved = useSavedStore(s => s.isSaved)

  useEffect(() => {
    if (id) fetchById(id)
    return () => clearCurrent()
  }, [id, fetchById, clearCurrent])

  if (loading) {
    return (
      <div className="pt-24 max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!current) {
    return (
      <div className="pt-32 text-center px-4">
        <h1 className="font-display text-2xl font-bold mb-4">Listing not found</h1>
        <Button asChild>
          <Link to="/listings">Browse listings</Link>
        </Button>
      </div>
    )
  }

  const listing = current
  const typeLabel = PROPERTY_TYPES.find(t => t.value === listing.propertyType)?.label

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: listing.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const isOwner = user?.id === listing.ownerId
  const saved = user ? isSaved(user.id, listing.id) : false

  const handleMessage = () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (isOwner) {
      navigate('/account?tab=messages')
      return
    }
    const convId = openConversation(listing, user.id, user.name)
    navigate(`/account?tab=messages&c=${convId}`)
  }

  const handleSave = () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: location } })
      return
    }
    toggleSaved(user.id, listing.id)
  }

  return (
    <div className="pt-20 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-primary-700 text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <ListingGallery images={listing.images} title={listing.title} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge>{typeLabel}</Badge>
                {listing.verified && (
                  <Badge variant="verified" className="flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4" />
                {listing.address}, {listing.city}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 py-6 border-y border-stone-200">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-primary-600" />
                <span>{listing.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-primary-600" />
                <span>{listing.bathrooms} Bathrooms</span>
              </div>
              {listing.areaSqFt && (
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-primary-600" />
                  <span>{listing.areaSqFt} sq ft</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-xl font-bold mb-3">About this property</h2>
              <p className="text-stone-600 leading-relaxed">{listing.description}</p>
            </div>

            {listing.amenities.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map(a => (
                    <Badge key={a} variant="muted">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-display text-xl font-bold mb-4">Location</h2>
              <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
                <ListingsMap listings={[listing]} className="h-72" />
              </Suspense>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-card p-6 border border-stone-100">
              <p className="text-3xl font-bold text-primary-800 mb-1">
                {formatLKRMonthly(listing.price)}
              </p>
              <p className="text-sm text-stone-500 mb-6">{listing.views} views</p>

              <div className="space-y-3 mb-6">
                {!isOwner && (
                  <Button className="w-full" size="lg" onClick={handleMessage}>
                    <MessageSquare className="w-4 h-4" />
                    Message landlord
                  </Button>
                )}
                {isOwner && (
                  <Button className="w-full" size="lg" variant="outline" asChild>
                    <Link to="/account?tab=messages">View inquiries</Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <a href={`tel:${listing.ownerPhone}`}>
                    <Phone className="w-4 h-4" />
                    Call {isOwner ? 'your listing' : 'landlord'}
                  </a>
                </Button>
              </div>

              <div className="border-t border-stone-100 pt-4">
                <p className="text-sm text-stone-500 mb-1">Listed by</p>
                <p className="font-semibold text-stone-900">{listing.ownerName}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                {!isOwner && (
                  <Button variant="ghost" size="sm" className="flex-1" onClick={handleSave}>
                    <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                    {saved ? 'Saved' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
