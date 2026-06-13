import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { formatLKRMonthly } from '@/lib/format'
import type { Listing } from '@/types'
import { cn } from '@/lib/utils'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface ListingsMapProps {
  listings: Listing[]
  className?: string
}

export default function ListingsMap({ listings, className }: ListingsMapProps) {
  const center: [number, number] =
    listings.length > 0
      ? [listings[0].lat, listings[0].lng]
      : [7.8731, 80.7718]

  useEffect(() => {
    // Leaflet needs explicit size recalc when container becomes visible
    window.dispatchEvent(new Event('resize'))
  }, [listings])

  return (
    <div className={cn('listings-map relative isolate overflow-hidden rounded-2xl', className)}>
      <MapContainer
        center={center}
        zoom={8}
        className="w-full h-full rounded-2xl"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map(listing => (
          <Marker key={listing.id} position={[listing.lat, listing.lng]}>
            <Popup>
              <div className="min-w-[180px]">
                <img
                  src={listing.images[0]}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <p className="font-semibold text-sm line-clamp-2">{listing.title}</p>
                <p className="text-primary-700 font-bold text-sm my-1">
                  {formatLKRMonthly(listing.price)}
                </p>
                <Link
                  to={`/listings/${listing.id}`}
                  className="text-primary-600 text-xs font-medium hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
