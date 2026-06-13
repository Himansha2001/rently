import { Link } from 'react-router-dom'
import { Globe, Mail, Phone, Share2 } from 'lucide-react'

const districts = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara']

export default function Footer() {
  return (
    <footer className="relative z-20 bg-primary-950 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center font-display font-bold text-accent-400">
                R
              </div>
              <span className="font-display text-xl font-bold text-white">Rently</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Sri Lanka&apos;s premium rental marketplace. Find your perfect home from Colombo to Galle.
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, Share2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-primary-900 flex items-center justify-center hover:bg-primary-700 transition-colors"
                  aria-label="Social"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Browse by City</h4>
            <ul className="space-y-2 text-sm">
              {districts.map(city => (
                <li key={city}>
                  <Link
                    to={`/listings?city=${encodeURIComponent(city)}`}
                    className="hover:text-accent-400 transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-accent-400 transition-colors">About Rently</Link></li>
              <li><Link to="/listings/new" className="hover:text-accent-400 transition-colors">List Your Property</Link></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-400" />
                hello@rently.lk
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-400" />
                +94 11 234 5678
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-800 text-sm text-stone-500 text-center">
          © {new Date().getFullYear()} Rently. All rights reserved. Made for Sri Lanka.
        </div>
      </div>
    </footer>
  )
}
