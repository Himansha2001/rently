import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Zap, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, defaultTransition } from '@/lib/motion'

const VALUES = [
  {
    icon: Shield,
    title: 'Trust & Verification',
    description: 'Every listing goes through verification so you rent with confidence across Sri Lanka.',
  },
  {
    icon: Zap,
    title: 'Speed & Simplicity',
    description: 'Find or list a property in minutes. No paperwork headaches, no endless phone calls.',
  },
  {
    icon: Heart,
    title: 'Built for Sri Lanka',
    description: 'From annexes in Nugegoda to villas in Kandy — we understand the local rental market.',
  },
]

export default function AboutPage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="pt-20">
      <section className="bg-primary-950 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={defaultTransition}
            className="font-display text-4xl md:text-5xl font-bold mb-6"
          >
            Redefining rentals in Sri Lanka
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, delay: 0.1 }}
            className="text-primary-200 text-lg leading-relaxed"
          >
            Rently is the premium marketplace connecting tenants and landlords island-wide.
            We combine beautiful design, verified listings, and technology that scales — so finding
            your next home feels effortless.
          </motion.p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4">
        <motion.div
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {VALUES.map(v => (
            <motion.div
              key={v.title}
              variants={reduceMotion ? undefined : fadeInUp}
              transition={defaultTransition}
              className="text-center p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-7 h-7 text-primary-700" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{v.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-stone-100 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Ready to get started?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link to="/listings">Browse listings</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
