import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, Heart, Home, MessageSquare, Plus, Pencil } from 'lucide-react'
import AccountNav from '@/components/account/AccountNav'
import MessageInbox from '@/components/messages/MessageInbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import ListingCard from '@/components/listings/ListingCard'
import { useAuthStore } from '@/store/authStore'
import { useListingStore } from '@/store/listingStore'
import { useMessageStore } from '@/store/messageStore'
import { useSavedStore } from '@/store/savedStore'
import { formatLKRMonthly } from '@/lib/format'
import type { AccountTab, Listing } from '@/types'
import { cn } from '@/lib/utils'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'

function AccountLoading() {
  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <Skeleton className="h-64 hidden lg:block" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  const hydrated = useAuthHydrated()
  const { user, updateProfile } = useAuthStore()
  const [params] = useSearchParams()
  const tab = (params.get('tab') as AccountTab) || 'overview'

  const getUnreadCount = useMessageStore(s => s.getUnreadCount)
  const getConversationsForUser = useMessageStore(s => s.getConversationsForUser)
  const unread = user ? getUnreadCount(user.id) : 0
  const conversations = user ? getConversationsForUser(user.id) : []

  const { fetchByOwner } = useListingStore()
  const getSavedIds = useSavedStore(s => s.getSavedIds)
  const getSavedListings = useSavedStore(s => s.getSavedListings)
  const syncSaved = useSavedStore(s => s.sync)

  const [myListings, setMyListings] = useState<Listing[]>([])
  const [savedListings, setSavedListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(true)

  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '')
  const [renterMode, setRenterMode] = useState(user?.isRenter ?? true)
  const [landlordMode, setLandlordMode] = useState(user?.isLandlord ?? true)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfileName(user.name)
    setProfilePhone(user.phone ?? '')
    setRenterMode(user.isRenter)
    setLandlordMode(user.isLandlord)
  }, [user])

  useEffect(() => {
    if (!user?.isLandlord) {
      setLoadingListings(false)
      return
    }
    fetchByOwner(user.id).then(data => {
      setMyListings(data)
      setLoadingListings(false)
    })
  }, [user, fetchByOwner])

  useEffect(() => {
    if (!user?.isRenter) {
      setLoadingSaved(false)
      return
    }
    syncSaved(user.id).then(() => {
      setSavedListings(getSavedListings(user.id))
      setLoadingSaved(false)
    })
  }, [user, getSavedListings, syncSaved, tab])

  if (!hydrated || !user) {
    return <AccountLoading />
  }

  const totalViews = myListings.reduce((sum, l) => sum + l.views, 0)

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renterMode && !landlordMode) return
    await updateProfile({
      name: profileName,
      phone: profilePhone,
      isRenter: renterMode,
      isLandlord: landlordMode,
    })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900">Account</h1>
          <p className="text-stone-600 mt-1">
            One place for renting, listing, and messages — switch roles anytime in Profile.
          </p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center font-display font-bold text-primary-800 text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.isRenter && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    Renter
                  </span>
                )}
                {user.isLandlord && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                    Landlord
                  </span>
                )}
              </div>
            </div>
            <AccountNav
              unreadCount={unread}
              isRenter={user.isRenter}
              isLandlord={user.isLandlord}
            />
          </aside>

          <div className="min-w-0">
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.isRenter && (
                    <Card>
                      <CardContent className="pt-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm text-stone-500">Saved homes</p>
                          <p className="text-2xl font-bold text-stone-900">
                            {getSavedIds(user.id).length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardContent className="pt-6 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Conversations</p>
                        <p className="text-2xl font-bold text-stone-900">{conversations.length}</p>
                        {unread > 0 && (
                          <p className="text-xs text-primary-700 font-medium">{unread} unread</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  {user.isLandlord && (
                    <>
                      <Card>
                        <CardContent className="pt-6 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                            <Home className="w-5 h-5 text-accent-800" />
                          </div>
                          <div>
                            <p className="text-sm text-stone-500">Active listings</p>
                            <p className="text-2xl font-bold text-stone-900">
                              {myListings.filter(l => l.status === 'approved').length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="sm:col-span-2 lg:col-span-1">
                        <CardContent className="pt-6 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-stone-600" />
                          </div>
                          <div>
                            <p className="text-sm text-stone-500">Listing views</p>
                            <p className="text-2xl font-bold text-stone-900">
                              {totalViews.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/listings">Browse rentals</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/account?tab=messages">Open inbox</Link>
                    </Button>
                    {user.isLandlord && (
                      <Button variant="accent" asChild>
                        <Link to="/listings/new">
                          <Plus className="w-4 h-4" />
                          List property
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'messages' && <MessageInbox />}

            {tab === 'listings' && user.isLandlord && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My listings</CardTitle>
                  <Button variant="accent" size="sm" asChild>
                    <Link to="/listings/new">
                      <Plus className="w-4 h-4" />
                      New
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingListings ? (
                    <Skeleton className="h-24 w-full" />
                  ) : myListings.length === 0 ? (
                    <p className="text-stone-600 text-center py-8">
                      No listings yet.{' '}
                      <Link to="/listings/new" className="text-primary-700 font-medium hover:underline">
                        Create one
                      </Link>
                    </p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {myListings.map(listing => (
                        <div
                          key={listing.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <img
                            src={listing.images[0]}
                            alt=""
                            className="w-full sm:w-24 h-20 object-cover rounded-xl"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{listing.title}</h3>
                            <p className="text-primary-700 font-medium">
                              {formatLKRMonthly(listing.price)}
                            </p>
                            <Badge variant={listing.status === 'approved' ? 'verified' : 'muted'}>
                              {listing.status}
                            </Badge>
                            {listing.rejectionReason && (
                              <p className="text-xs text-red-500 mt-1">{listing.rejectionReason}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/listings/${listing.id}`}>View</Link>
                            </Button>
                            <Button variant="ghost" size="sm" disabled>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 'saved' && user.isRenter && (
              <div>
                {loadingSaved ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Skeleton className="aspect-[4/3]" />
                    <Skeleton className="aspect-[4/3]" />
                  </div>
                ) : savedListings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Heart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-600 mb-4">No saved homes yet.</p>
                      <Button asChild>
                        <Link to="/listings">Browse listings</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {savedListings.map((listing, i) => (
                      <ListingCard key={listing.id} listing={listing} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile & roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-6 max-w-md">
                    <div>
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                    <div>
                      <Label className="mb-3 block">I use Rently as a</Label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50">
                          <input
                            type="checkbox"
                            checked={renterMode}
                            onChange={e => setRenterMode(e.target.checked)}
                            className="mt-1 rounded border-stone-300 text-primary-600"
                          />
                          <div>
                            <p className="font-medium text-stone-900">Renter</p>
                            <p className="text-sm text-stone-500">
                              Save homes, message landlords, track inquiries
                            </p>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50">
                          <input
                            type="checkbox"
                            checked={landlordMode}
                            onChange={e => setLandlordMode(e.target.checked)}
                            className="mt-1 rounded border-stone-300 text-primary-600"
                          />
                          <div>
                            <p className="font-medium text-stone-900">Landlord</p>
                            <p className="text-sm text-stone-500">
                              Publish listings, reply to tenants, view stats
                            </p>
                          </div>
                        </label>
                      </div>
                      {!renterMode && !landlordMode && (
                        <p className="text-red-500 text-sm mt-2">Select at least one role</p>
                      )}
                    </div>
                    <Button type="submit" disabled={!renterMode && !landlordMode}>
                      {profileSaved ? 'Saved' : 'Save changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Mobile tab picker */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-2 flex justify-around z-30">
              {(['overview', 'messages', 'listings', 'saved', 'profile'] as AccountTab[])
                .filter(t => {
                  if (t === 'listings' && !user.isLandlord) return false
                  if (t === 'saved' && !user.isRenter) return false
                  return true
                })
                .slice(0, 4)
                .map(t => (
                  <Link
                    key={t}
                    to={`/account?tab=${t}`}
                    className={cn(
                      'text-xs font-medium px-2 py-2 capitalize',
                      tab === t ? 'text-primary-700' : 'text-stone-500',
                    )}
                  >
                    {t}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
