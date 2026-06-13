import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { defaultTransition } from '@/lib/motion'

const STEPS = [
  {
    label: '01',
    title: 'Narrow it down fast',
    detail:
      'Filter by Colombo 7, Kandy, Galle — or annex, room, and monthly budget in LKR. Map view shows you what’s actually on the market, not just what photographs well.',
    tag: 'Search',
  },
  {
    label: '02',
    title: 'Speak to the person who owns it',
    detail:
      'Call or message the landlord directly. No opaque agent layers, no surprise fees buried in fine print. You decide which viewings are worth your Saturday morning.',
    tag: 'Connect',
  },
  {
    label: '03',
    title: 'Move in — or list what you have',
    detail:
      'Tenants close the deal with confidence. Landlords publish in minutes with photos, pin location, and set rent in rupees. One platform for both sides of the market.',
    tag: 'Settle',
  },
] as const

export default function HowItWorks() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Soft atmosphere — not a flat grey slab */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white via-stone-50/80 to-primary-950/[0.03]"
        aria-hidden
      />
      <div
        className="absolute -right-32 top-1/4 w-[480px] h-[480px] rounded-full bg-primary-200/30 blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left: editorial intro — stays visible while steps scroll on large screens */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={defaultTransition}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <p className="text-primary-700 font-semibold text-xs tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-stone-900 leading-[1.15] tracking-tight">
              Renting in Sri Lanka,
              <span className="block text-primary-800">without the runaround.</span>
            </h2>
            <p className="mt-5 text-stone-600 leading-relaxed max-w-md">
              Whether you’re hunting a room near campus or letting out an annex in Nugegoda, the flow
              is the same — clear listings, honest contact, no template marketplace noise.
            </p>

            <div className="mt-8 hidden lg:block relative rounded-2xl overflow-hidden aspect-[4/5] max-w-sm shadow-card">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-white/90 text-sm leading-snug">
                Verified listings across 25+ cities — from coastal Galle to Colombo&apos;s inner wards.
              </p>
            </div>

            <Button variant="outline" className="mt-8 lg:hidden" asChild>
              <Link to="/listings">
                Browse listings
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Right: vertical journey — not three clone cards */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Timeline spine */}
              <div
                className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-primary-400 via-primary-300 to-transparent hidden sm:block"
                aria-hidden
              />

              <ul className="space-y-0">
                {STEPS.map((step, i) => (
                  <motion.li
                    key={step.label}
                    initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ ...defaultTransition, delay: i * 0.12 }}
                    className="relative sm:pl-12 py-10 sm:py-12 border-b border-stone-200/80 last:border-0"
                  >
                    {/* Node on timeline */}
                    <span
                      className="absolute left-0 top-12 sm:top-14 hidden sm:flex w-6 h-6 rounded-full border-2 border-primary-500 bg-white items-center justify-center"
                      aria-hidden
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                    </span>

                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-3">
                      <span className="font-mono text-sm text-accent-700 font-medium tabular-nums">
                        {step.label}
                      </span>
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400">
                        {step.tag}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-[1.65rem] font-bold text-stone-900 mb-3 pr-4">
                      {step.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed max-w-xl">{step.detail}</p>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...defaultTransition, delay: 0.2 }}
              className="mt-6 flex flex-wrap items-center gap-4"
            >
              <Button asChild>
                <Link to="/listings">
                  See what&apos;s available
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
              <Link
                to="/listings/new"
                className="text-sm font-medium text-stone-600 hover:text-primary-800 underline-offset-4 hover:underline"
              >
                I&apos;m a landlord — list a property
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
