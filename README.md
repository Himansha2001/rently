# Rently

Rently is a production property rental marketplace for Sri Lanka. The frontend is a React/Vite application and the backend foundation is a NestJS API using MongoDB for marketplace data and Firebase Authentication for identity only.

## Current Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, React Router, React Hook Form, Zod, React Leaflet.
- Backend: Node.js, NestJS, TypeScript, MongoDB, Mongoose.
- Auth: Firebase Authentication client SDK on the frontend and Firebase Admin SDK token verification on the backend.
- Database: MongoDB. Do not use Firestore for Rently marketplace data.

## Local Setup

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
npm --prefix server install
npm --prefix server run dev
```

Frontend runs on `http://localhost:5173` by default. Backend runs on `http://localhost:3000/api` by default.

## Environment

Copy examples locally and fill real values. Do not commit real `.env` files.

- Frontend: `.env.example`
- Backend: `server/.env.example`

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Home and search entry |
| `/listings` | Browse approved listings with filters, map, and radius search |
| `/listings/:id` | Listing detail with sanitized public contact handling |
| `/listings/new` | Authenticated listing creation with map pin |
| `/account` | User dashboard, messages, listings, saved homes, profile |
| `/admin` | Admin moderation queue |
| `/login`, `/register` | Firebase Auth UI |
| `/about` | About Rently |

## Business Rules

- Public visitors can browse approved listings.
- Contact details require login.
- Every registered account starts as `user`.
- Any registered user can create a listing.
- Creating a first listing promotes the user to `landlord`.
- Admin approval is required before a listing becomes publicly active.
- Admin role is not self-assignable from the frontend.
- In-app messaging and saved listings are backend-backed.
- Radius search uses MongoDB geospatial queries.
- Firebase is auth only.
- MySQL is reserved for future clearly justified needs.

## Documentation

See [docs/README.md](./docs/README.md) for architecture, API, database, auth, moderation, radius search, deployment notes, and Mermaid diagrams.
