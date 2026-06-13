import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/motion'

const STATS = [
  { value: '5,000+', label: 'Active Listings' },
  { value: '25+', label: 'Cities Covered' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support' },
]

export default function Stats() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="py-16 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {STATS.map(stat => (
            <motion.div
              key={stat.label}
              variants={reduceMotion ? undefined : fadeInUp}
              transition={defaultTransition}
              className="text-center"
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-primary-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-stone-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
