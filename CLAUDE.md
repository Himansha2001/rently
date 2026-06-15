# Rently Agent Context

## Project Summary

Rently is a real production property rental marketplace for Sri Lanka. It has public renter browsing, landlord listing management, and admin moderation.

## Confirmed Business Rules

- Public visitors can browse approved listings.
- Sensitive contact details require login.
- Every registered account starts as `user`.
- Any registered user can create a listing.
- Creating a first listing promotes the user to `landlord`.
- New listings default to `pending`.
- Admin approval is required before public visibility.
- Admin role is not self-assignable.
- In-app messaging is required.
- Radius-based search is required.
- Landlords must pin listing location on a map.
- Listing creation requires at least one real uploaded property image.
- Monetization is not required for MVP.

## Tech Stack Decisions

- Frontend: React, Vite, TypeScript, Tailwind, Zustand.
- Backend: Node.js, NestJS, TypeScript.
- Database: MongoDB with Mongoose.
- Auth: Firebase Authentication only.
- Backend auth verification: Firebase Admin SDK.
- Listing media: S3-compatible object storage via the NestJS API.
- Do not use Firestore, Firebase Storage, Firebase Realtime Database, or Firebase Cloud Functions for app data.
- MySQL is allowed later only when clearly justified.

## How To Run

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
npm --prefix server install
npm --prefix server run dev
npm --prefix server run seed:admin
```

`seed:admin` requires `MONGODB_URI` and either `FIREBASE_UID` or `ADMIN_EMAIL`. It promotes an existing MongoDB user with `$addToSet` and is not a public API endpoint.

## Important Folders

- `src/`: frontend app.
- `server/`: NestJS API.
- `server/scripts/seed-admin.ts`: offline first-admin bootstrap.
- `docs/`: technical documentation.
- `docs/diagrams/`: Mermaid diagrams.

## Rules For Future Agents

- Do not expose secrets or commit real `.env` files.
- Preserve existing UI unless required for backend integration.
- Keep Firebase limited to auth.
- Never use Firebase Storage; listing images use S3-compatible object storage.
- Keep MongoDB as the primary data store.
- Enforce roles on the backend, not the client.
- Keep public listing responses sanitized.
- Keep location data in MongoDB GeoJSON `[lng, lat]` format.
- Validate MongoDB ObjectId route params before calling Mongoose.
- Do not expose raw database, schema, stack trace, or storage errors to API clients.
