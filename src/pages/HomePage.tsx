import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import HowItWorks from '@/components/home/HowItWorks'
import ListingCard from '@/components/listings/ListingCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useListingStore } from '@/store/listingStore'
import { fadeInUp, defaultTransition } from '@/lib/motion'

export default function HomePage() {
  const { featured, fetchFeatured } = useListingStore()

  useEffect(() => {
    fetchFeatured()
  }, [fetchFeatured])

  return (
    <div>
      <Hero />
      <Stats />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-2">
                Featured properties
              </h2>
              <p className="text-stone-600">Hand-picked premium rentals across the island</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/listings">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {featured.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorks />

      <section className="py-24 bg-primary-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-700/40 via-transparent to-transparent" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={defaultTransition}
          className="relative max-w-4xl mx-auto px-4 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to list your property?
          </h2>
          <p className="text-primary-200 mb-8 max-w-xl mx-auto">
            Join thousands of landlords across Sri Lanka. Create your listing in under 5 minutes.
          </p>
          <Button variant="accent" size="lg" asChild>
            <Link to="/listings/new">
              List your property free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  )
}
