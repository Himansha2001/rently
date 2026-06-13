import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp, defaultTransition } from '@/lib/motion'

export default function NotFoundPage() {
  return (
    <div className="pt-32 min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={defaultTransition}
        className="text-center"
      >
        <p className="font-display text-8xl font-bold text-primary-200">404</p>
        <h1 className="font-display text-2xl font-bold text-stone-900 mt-4 mb-2">Page not found</h1>
        <p className="text-stone-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4" />
            Back to home
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
