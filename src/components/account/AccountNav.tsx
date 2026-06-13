import { Link, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Home,
  Heart,
  User,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AccountTab } from '@/types'

const TABS: { id: AccountTab; label: string; icon: typeof LayoutDashboard; renter?: boolean; landlord?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'listings', label: 'My listings', icon: Home, landlord: true },
  { id: 'saved', label: 'Saved homes', icon: Heart, renter: true },
  { id: 'profile', label: 'Profile', icon: User },
]

interface AccountNavProps {
  unreadCount?: number
  isRenter: boolean
  isLandlord: boolean
}

export default function AccountNav({ unreadCount = 0, isRenter, isLandlord }: AccountNavProps) {
  const [params, setParams] = useSearchParams()
  const active = (params.get('tab') as AccountTab) || 'overview'

  const visibleTabs = TABS.filter(t => {
    if (t.landlord && !isLandlord) return false
    if (t.renter && !isRenter) return false
    return true
  })

  const setTab = (tab: AccountTab) => {
    const next = new URLSearchParams(params)
    next.set('tab', tab)
    if (tab !== 'messages') next.delete('c')
    setParams(next, { replace: true })
  }

  return (
    <nav className="flex flex-col gap-1">
      {visibleTabs.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors w-full',
              isActive
                ? 'bg-primary-700 text-white shadow-md'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{tab.label}</span>
            {tab.id === 'messages' && unreadCount > 0 && (
              <span
                className={cn(
                  'min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center',
                  isActive ? 'bg-accent-400 text-stone-900' : 'bg-primary-600 text-white',
                )}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )
      })}

      {isLandlord && (
        <Link
          to="/listings/new"
          className="mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent-500 text-stone-900 text-sm font-semibold hover:bg-accent-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          List a property
        </Link>
      )}
    </nav>
  )
}
