import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string(),
  })
  .refine(data => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [isRenter, setIsRenter] = useState(true)
  const [isLandlord, setIsLandlord] = useState(false)
  const navigate = useNavigate()
  const register = useAuthStore(s => s.register)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!isRenter && !isLandlord) return
    setLoading(true)
    await register(data.name, data.email, data.password, { isRenter, isLandlord })
    navigate('/account', { replace: true })
    setLoading(false)
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
          <h1 className="font-display text-2xl font-bold text-stone-900">Join Rently</h1>
          <p className="text-stone-600 text-sm mt-1">List and manage properties across Sri Lanka</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register('password')} />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" {...form.register('confirm')} />
                {form.formState.errors.confirm && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.confirm.message}</p>
                )}
              </div>
              <div>
                <Label className="mb-2 block">I want to</Label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isRenter}
                      onChange={e => setIsRenter(e.target.checked)}
                      className="rounded border-stone-300 text-primary-600"
                    />
                    Find a place to rent
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isLandlord}
                      onChange={e => setIsLandlord(e.target.checked)}
                      className="rounded border-stone-300 text-primary-600"
                    />
                    List my property
                  </label>
                </div>
              </div>
              <Button
                type="submit"
                variant="accent"
                className="w-full"
                disabled={loading || (!isRenter && !isLandlord)}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            <p className="text-center text-sm text-stone-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-700 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
