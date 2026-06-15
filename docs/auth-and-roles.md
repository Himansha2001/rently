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

## First Admin Bootstrap

Admin role assignment is not exposed through the frontend or public API. Promote the first admin from a trusted backend environment after that user has logged in once:

```bash
FIREBASE_UID=firebase-user-uid npm --prefix server run seed:admin
ADMIN_EMAIL=admin@example.com npm --prefix server run seed:admin
```

The script finds the existing MongoDB user profile and adds `admin` with `$addToSet`. It does not remove `user` or `landlord` roles and cannot create a Firebase account.

## Profile Validation

Profile updates validate optional `avatarUrl` as a URL. Roles are never accepted from client profile update payloads.
