import { motion, useReducedMotion } from 'framer-motion'
import { defaultTransition, fadeInUp } from '@/lib/motion'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <>{children}</>

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  )
}
