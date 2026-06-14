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

`FIREBASE_PRIVATE_KEY` should preserve escaped newlines as `\n`.

## Commands

```bash
npm --prefix server run dev
npm --prefix server run build
npm --prefix server run start
npm --prefix server run typecheck
```

## API Prefix

All API routes are mounted under `/api`.
