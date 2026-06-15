import { useEffect, useState } from 'react'
import { Archive, Check, Star, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Listing } from '@/types'
import { formatLKRMonthly } from '@/lib/format'

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<{ items: Listing[] }>('/admin/listings?status=pending&page=1&limit=50', {
        auth: true,
      })
      setListings(data.items)
    } catch {
      setError('Could not load pending listings. Check your admin access and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const approve = async (id: string) => {
    setActionLoading(`approve:${id}`)
    setError(null)
    try {
      await apiFetch(`/admin/listings/${id}/approve`, { method: 'PATCH', auth: true })
      await load()
    } catch {
      setError('Could not approve the listing. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const reject = async (id: string) => {
    setActionLoading(`reject:${id}`)
    setError(null)
    try {
      await apiFetch(`/admin/listings/${id}/reject`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ reason: reason || 'Rejected by moderator' }),
      })
      setRejecting(null)
      setReason('')
      await load()
    } catch {
      setError('Could not reject the listing. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const feature = async (id: string, featured: boolean) => {
    setActionLoading(`feature:${id}`)
    setError(null)
    try {
      await apiFetch(`/admin/listings/${id}/feature`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ featured }),
      })
      await load()
    } catch {
      setError('Could not update featured status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const archive = async (id: string) => {
    setActionLoading(`archive:${id}`)
    setError(null)
    try {
      await apiFetch(`/admin/listings/${id}/archive`, { method: 'PATCH', auth: true })
      await load()
    } catch {
      setError('Could not archive the listing. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900">Admin moderation</h1>
          <p className="text-stone-600 mt-1">Review pending listings before they become public.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending listings</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {loading ? (
              <p className="text-stone-500">Loading pending listings...</p>
            ) : listings.length === 0 ? (
              <p className="text-stone-500">No pending listings.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {listings.map(listing => (
                  <div key={listing.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={listing.images[0]}
                        alt=""
                        className="w-full md:w-36 h-28 object-cover rounded-xl bg-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge>{listing.propertyType}</Badge>
                          <Badge variant="muted">{listing.status}</Badge>
                        </div>
                        <h2 className="font-semibold text-stone-900">{listing.title}</h2>
                        <p className="text-primary-700 font-semibold">{formatLKRMonthly(listing.price)}</p>
                        <p className="text-sm text-stone-500">
                          {listing.address}, {listing.city}, {listing.district}
                        </p>
                        <p className="text-sm text-stone-600 mt-2 line-clamp-2">{listing.description}</p>
                        <p className="text-xs text-stone-500 mt-2">
                          Contact: {listing.contactName ?? listing.ownerName} {listing.contactPhone ? `- ${listing.contactPhone}` : ''}
                        </p>
                      </div>
                      <div className="md:w-56 flex md:flex-col gap-2">
                        <Button
                          onClick={() => approve(listing.id)}
                          className="flex-1"
                          disabled={Boolean(actionLoading)}
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setRejecting(rejecting === listing.id ? null : listing.id)}
                          className="flex-1"
                          disabled={Boolean(actionLoading)}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => feature(listing.id, !listing.featured)}
                          className="flex-1"
                          disabled={Boolean(actionLoading)}
                        >
                          <Star className="w-4 h-4" />
                          {listing.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => archive(listing.id)}
                          className="flex-1"
                          disabled={Boolean(actionLoading)}
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </Button>
                      </div>
                    </div>
                    {rejecting === listing.id && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <input
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          placeholder="Reason for rejection"
                          className="flex-1 h-10 px-3 rounded-xl border border-stone-200 bg-white text-sm"
                        />
                        <Button
                          variant="accent"
                          onClick={() => reject(listing.id)}
                          disabled={Boolean(actionLoading)}
                        >
                          {actionLoading === `reject:${listing.id}` ? 'Rejecting...' : 'Confirm reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
