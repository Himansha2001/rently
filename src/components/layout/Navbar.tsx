import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Plus, User, LogIn, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/listings', label: 'Browse' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { user, isAuthenticated, logout } = useAuthStore()
  const unreadMessages = useMessageStore(s =>
    user ? s.getUnreadCount(user.id) : 0,
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const solid = scrolled || !isHome

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        solid ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg transition-colors',
              solid ? 'bg-primary-700 text-accent-400' : 'bg-white/20 text-accent-400 border border-white/30',
            )}
          >
            R
          </div>
          <span
            className={cn(
              'font-display text-xl font-bold tracking-tight',
              solid ? 'text-primary-950' : 'text-white',
            )}
          >
            Rently
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors',
                  solid
                    ? isActive
                      ? 'text-primary-700'
                      : 'text-stone-600 hover:text-primary-700'
                    : isActive
                      ? 'text-white'
                      : 'text-white/80 hover:text-white',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant={solid ? 'outline' : 'ghost'} size="sm" asChild>
                <Link to="/listings/new" className={!solid ? 'text-white border-white/40' : ''}>
                  <Plus className="w-4 h-4" />
                  List Property
                </Link>
              </Button>
              <Button variant={solid ? 'ghost' : 'ghost'} size="sm" asChild className="relative">
                <Link to="/account" className={!solid ? 'text-white' : ''}>
                  <User className="w-4 h-4" />
                  Account
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-500 text-[10px] font-bold text-stone-900 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={!solid ? 'text-white/80' : ''}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant={solid ? 'ghost' : 'ghost'} size="sm" asChild>
                <Link to="/login" className={!solid ? 'text-white' : ''}>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              </Button>
              <Button variant="accent" size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn('md:hidden p-2 rounded-lg', solid ? 'text-stone-800' : 'text-white')}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-100 shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="py-2 text-stone-700 font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/listings/new" className="py-2 text-stone-700 font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> List Property
                  </Link>
                  <Link to="/account" className="py-2 text-stone-700 font-medium flex items-center gap-2">
                    <User className="w-4 h-4" /> Account
                    {unreadMessages > 0 && (
                      <span className="text-xs bg-primary-600 text-white px-1.5 rounded-full">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                  <button type="button" onClick={logout} className="py-2 text-left text-stone-500">
                    Sign out ({user?.name})
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-2 text-stone-700 font-medium">Sign in</Link>
                  <Button variant="accent" asChild className="w-full">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
