import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DETAIL_MAP_ZOOM = 15

const propertyMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

interface ListingLocationMapProps {
  lat?: number | null
  lng?: number | null
  className?: string
}

interface MapViewSyncProps {
  lat: number
  lng: number
}

function MapViewSync({ lat, lng }: MapViewSyncProps) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], DETAIL_MAP_ZOOM, { animate: false })
    map.invalidateSize()
  }, [lat, lng, map])

  return null
}

function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90
}

function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180
}

export default function ListingLocationMap({ lat, lng, className }: ListingLocationMapProps) {
  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return (
      <div
        className={cn(
          'flex h-72 items-center justify-center gap-2 rounded-2xl bg-stone-100 px-6 text-center text-stone-600',
          className,
        )}
        role="status"
      >
        <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>Map unavailable because this listing has no valid coordinates.</span>
      </div>
    )
  }

  const center: [number, number] = [lat, lng]

  return (
    <div
      className={cn('listings-map relative isolate h-72 overflow-hidden rounded-2xl', className)}
      role="region"
      aria-label="Property location map"
    >
      <MapContainer
        center={center}
        zoom={DETAIL_MAP_ZOOM}
        className="h-full w-full rounded-2xl"
        scrollWheelZoom={false}
      >
        <MapViewSync lat={lat} lng={lng} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={propertyMarkerIcon} />
      </MapContainer>
    </div>
  )
}
