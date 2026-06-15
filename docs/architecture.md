# Architecture

## Overview

Rently is split into two applications in one repository:

- `src/`: existing React/Vite/TypeScript frontend.
- `server/`: NestJS API using MongoDB with Mongoose and Firebase Admin token verification.

The frontend uses Firebase Client SDK only to register, log in, log out, and retrieve ID tokens. The backend verifies those tokens and stores all marketplace data in MongoDB. Listing media is uploaded through the NestJS API to S3-compatible object storage; Firebase Storage is not used.

## Runtime Flow

1. User authenticates with Firebase Auth in the browser.
2. Frontend sends `Authorization: Bearer <firebase_id_token>` to the NestJS API.
3. Backend verifies the token with Firebase Admin SDK.
4. Backend creates or updates the MongoDB user profile.
5. API guards use MongoDB roles for authorization.
6. Listings, messages, saved listings, and moderation state live in MongoDB.
7. Listing image uploads go through `POST /api/uploads/listing-images` and are stored in S3-compatible object storage.

## Security Boundary

The client never grants roles. The first admin is bootstrapped with the offline `npm --prefix server run seed:admin` script using `FIREBASE_UID` or `ADMIN_EMAIL`. There is no public "make admin" endpoint.

## Future Extensions

- WebSocket gateway for realtime messages.
- Search engine such as Atlas Search, Typesense, or Elasticsearch if marketplace search grows beyond MongoDB filters.
- MySQL only for a clearly justified future reporting/accounting workload.
