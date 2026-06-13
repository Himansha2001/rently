import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { fadeInUp, defaultTransition } from '@/lib/motion'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore(s => s.login)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/account'

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'demo@rently.lk', password: 'demo123' },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 flex items-center justify-center px-4 pb-16">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={defaultTransition}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-700 text-accent-400 font-display font-bold text-xl flex items-center justify-center mx-auto mb-4">
            R
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-stone-600 text-sm mt-1">Sign in to manage your listings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-xs text-stone-500 bg-stone-50 rounded-lg p-3">
                Demo: any email/password works. Firebase Auth connects in phase 2.
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <p className="text-center text-sm text-stone-600 mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary-700 font-medium hover:underline">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
