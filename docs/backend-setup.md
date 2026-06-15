# Backend Setup

## Location

The backend lives in `server/`.

## Install

```bash
npm --prefix server install
```

## Environment

Create `server/.env` locally from `server/.env.example`. Do not commit real secrets.

Required variables:

- `PORT`
- `MONGODB_URI`
- `CORS_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_PUBLIC_BASE_URL`

`FIREBASE_PRIVATE_KEY` should preserve escaped newlines as `\n`.

S3 settings can point to AWS S3, Cloudflare R2, Backblaze B2, or another compatible provider. Listing images are uploaded through the API and stored outside Firebase.

## Commands

```bash
npm --prefix server run dev
npm --prefix server run build
npm --prefix server run start
npm --prefix server run typecheck
npm --prefix server run seed:admin
```

## API Prefix

All API routes are mounted under `/api`.

## Admin Bootstrap

The first admin must be promoted with the offline script after the user has logged in once and has a MongoDB user profile:

```bash
FIREBASE_UID=firebase-user-uid npm --prefix server run seed:admin
ADMIN_EMAIL=admin@example.com npm --prefix server run seed:admin
```

The script uses `$addToSet`, so it never removes existing roles. It requires `MONGODB_URI` and either `FIREBASE_UID` or `ADMIN_EMAIL`.

## Production Indexing

Mongoose `autoIndex` is enabled outside production and disabled when `NODE_ENV=production`. Create/verify required MongoDB indexes during deployment, including the `location` `2dsphere` index.
