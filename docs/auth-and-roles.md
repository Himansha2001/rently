# Auth And Roles

## Identity

Firebase Auth is the identity provider. The backend accepts only Firebase ID tokens and verifies them with Firebase Admin SDK.

## MongoDB Profile

Each verified Firebase account maps to one MongoDB user profile:

- `firebaseUid`
- `email`
- `displayName`
- `name`
- `phone`
- `avatarUrl`
- `roles`
- `isEmailVerified`
- `status`

## Roles

- `user`: every registered account.
- `landlord`: assigned automatically when the user creates a first listing.
- `admin`: never self-assignable from frontend.

## Rules

- Public visitors can browse approved listings only.
- Contact details require login.
- Listing creation requires login.
- Admin moderation requires `admin`.
- Owner cannot approve their own listing.
