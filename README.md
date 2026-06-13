# Rently — Premium Property Rentals (Sri Lanka)

A premium, fast, animated frontend for discovering and listing rental properties across Sri Lanka.

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 3** — teal/gold brand system
- **Framer Motion** — page transitions, scroll reveals
- **shadcn-style UI** — Radix primitives + CVA
- **Zustand** — auth & listing state
- **React Leaflet** — maps (OpenStreetMap)
- **Mock data layer** — swap to Firebase in phase 2

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build
npm run preview  # preview production build
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — hero search, featured listings |
| `/listings` | Browse with filters + map toggle |
| `/listings/:id` | Listing detail + gallery |
| `/listings/new` | Create listing wizard (auth required) |
| `/dashboard` | Landlord dashboard (auth required) |
| `/login`, `/register` | Auth UI (mock) |
| `/about` | About Rently |

**Demo login:** any email + password (6+ chars). Dashboard shows listings for demo user `u1`.

## Firebase (Phase 2)

Firebase is recommended for ~10k users. To integrate:

1. `npm install firebase`
2. `firebase init` — Hosting, Firestore, Storage, Auth
3. Add `.env.local`:

   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

4. Implement `src/data/repositories/firebaseListingRepository.ts`
5. Change `src/data/index.ts` to export `firebaseListingRepository`

### Firestore schema (sketch)

```
users/{userId}
listings/{listingId}
listings/{listingId}/inquiries/{inquiryId}
```

### Security rules (sketch)

- Public read: `listings` where `status == 'active'`
- Write: authenticated owner only on their listings

### Scale notes (10k users)

- Use auto-generated document IDs
- Paginate listing queries; avoid unbounded listeners
- Store images in Cloud Storage with CDN
- Consider Algolia/Typesense for full-text search later
- Firestore region: `asia-south1` or multi-region for HA

## Project structure

```
src/
├── components/   # UI, layout, listings, home, map
├── data/         # mock data + repository pattern
├── hooks/
├── lib/          # utils, motion, formatLKR
├── pages/
├── store/
└── types/
```

## License

Private — Code Media
