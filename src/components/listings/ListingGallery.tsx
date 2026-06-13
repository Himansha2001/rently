import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingGalleryProps {
  images: string[]
  title: string
}

export default function ListingGallery({ images, title }: ListingGalleryProps) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setActive(i => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActive(i => (i === images.length - 1 ? 0 : i + 1))

  if (!images.length) return null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto md:min-h-[400px] group"
        >
          <img
            src={images[active]}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </button>
        {images.slice(0, 4).map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => {
              setActive(i)
              setLightbox(true)
            }}
            className={cn(
              'relative aspect-[4/3] hidden md:block overflow-hidden',
              i === active && 'ring-2 ring-primary-500 ring-inset',
            )}
          >
            <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
              onClick={() => setLightbox(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <button
              type="button"
              className="absolute left-4 text-white p-3 rounded-full hover:bg-white/10"
              onClick={e => {
                e.stopPropagation()
                prev()
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <img
              src={images[active]}
              alt={title}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button
              type="button"
              className="absolute right-4 text-white p-3 rounded-full hover:bg-white/10"
              onClick={e => {
                e.stopPropagation()
                next()
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 text-white/70 text-sm">
              {active + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
