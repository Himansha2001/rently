import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CITIES, PROPERTY_TYPES, PRICE_RANGES } from '@/utils/constants'
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/motion'
import type { PropertyType } from '@/types'

export default function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState<PropertyType | 'all'>('all')
  const [priceIdx, setPriceIdx] = useState(0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (city) params.set('city', city)
    if (type !== 'all') params.set('type', type)
    const range = PRICE_RANGES[priceIdx]
    if (range.min > 0) params.set('minPrice', String(range.min))
    if (range.max < Infinity) params.set('maxPrice', String(range.max))
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(13,79,79,0.92) 0%, rgba(15,118,110,0.85) 50%, rgba(13,79,79,0.95) 100%), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div
            variants={fadeInUp}
            transition={defaultTransition}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-white/90 mb-6"
          >
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
            5,000+ verified listings across Sri Lanka
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            transition={defaultTransition}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Find your perfect
            <span className="block text-accent-300">rental in Sri Lanka</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={defaultTransition}
            className="text-lg md:text-xl text-primary-100 mb-10 max-w-xl leading-relaxed"
          >
            Premium apartments, annexes, rooms, and commercial spaces — from Colombo to Galle.
          </motion.p>

          <motion.form
            variants={fadeInUp}
            transition={defaultTransition}
            onSubmit={handleSearch}
            className="glass rounded-2xl p-4 shadow-2xl max-w-4xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search area or address..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative">
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white text-stone-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All cities</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={type}
                  onChange={e => setType(e.target.value as PropertyType | 'all')}
                  className="w-full h-12 px-4 rounded-xl bg-white text-stone-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <select
                value={priceIdx}
                onChange={e => setPriceIdx(Number(e.target.value))}
                className="flex-1 h-11 px-4 rounded-xl bg-white/90 text-stone-900 text-sm"
              >
                {PRICE_RANGES.map((r, i) => (
                  <option key={r.label} value={i}>{r.label}</option>
                ))}
              </select>
              <Button type="submit" variant="accent" size="lg" className="sm:min-w-[160px]">
                <Search className="w-5 h-5" />
                Search
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
