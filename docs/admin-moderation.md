# Admin Moderation

## Listing Lifecycle

1. Registered user creates listing.
2. Backend promotes user to landlord if needed.
3. Listing starts as `pending`.
4. Admin reviews listing.
5. Admin approves, rejects, features, or archives.
6. Only `approved` listings are publicly visible.

## Admin UI

The frontend includes `/admin`, protected by client role checks for UX and backend role guards for security. The admin listing feed uses paginated `GET /api/admin/listings?status=pending&page=1&limit=50`.

## First Admin Bootstrap

There is no public admin self-assignment route. Run the backend script from a trusted environment:

```bash
FIREBASE_UID=firebase-user-uid npm --prefix server run seed:admin
ADMIN_EMAIL=admin@example.com npm --prefix server run seed:admin
```

The target user must already exist in MongoDB, which happens after a successful Firebase-authenticated session request.

## Security Rules

- Admin role comes from MongoDB, not from frontend input.
- Owners cannot approve their own listing.
- Rejection requires a reason.
- Approval stores `approvedAt` and `approvedBy`.
- Admin action route IDs are validated as MongoDB ObjectIds before database access.
