# Architecture

## Overview

Rently is split into two applications in one repository:

- `src/`: existing React/Vite/TypeScript frontend.
- `server/`: NestJS API using MongoDB with Mongoose and Firebase Admin token verification.

The frontend uses Firebase Client SDK only to register, log in, log out, and retrieve ID tokens. The backend verifies those tokens and stores all marketplace data in MongoDB.

## Runtime Flow

1. User authenticates with Firebase Auth in the browser.
2. Frontend sends `Authorization: Bearer <firebase_id_token>` to the NestJS API.
3. Backend verifies the token with Firebase Admin SDK.
4. Backend creates or updates the MongoDB user profile.
5. API guards use MongoDB roles for authorization.
6. Listings, messages, saved listings, and moderation state live in MongoDB.

## Security Boundary

The client never grants roles. Admin role assignment must happen outside the public frontend, for example by a trusted database/admin script or future secure admin user-management endpoint.

## Future Extensions

- Object storage for listing photos, not Firebase Storage.
- WebSocket gateway for realtime messages.
- Search engine such as Atlas Search, Typesense, or Elasticsearch if marketplace search grows beyond MongoDB filters.
- MySQL only for a clearly justified future reporting/accounting workload.
