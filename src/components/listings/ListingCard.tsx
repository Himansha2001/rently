import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bed, Bath, MapPin, BadgeCheck, Maximize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatLKRMonthly } from '@/lib/format'
import type { Listing } from '@/types'
import { PROPERTY_TYPES } from '@/utils/constants'

interface ListingCardProps {
  listing: Listing
  index?: number
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const typeLabel = PROPERTY_TYPES.find(t => t.value === listing.propertyType)?.label ?? listing.propertyType

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/listings/${listing.id}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="default">{typeLabel}</Badge>
            {listing.verified && (
              <Badge variant="verified" className="flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              View
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-stone-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
              {listing.title}
            </h3>
          </div>
          <p className="text-primary-700 font-bold text-lg mb-3">{formatLKRMonthly(listing.price)}</p>
          <div className="flex items-center gap-1 text-stone-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{listing.city}, {listing.district}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-stone-600">
            {listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {listing.bedrooms} bed
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {listing.bathrooms} bath
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
