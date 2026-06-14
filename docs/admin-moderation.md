# Admin Moderation

## Listing Lifecycle

1. Registered user creates listing.
2. Backend promotes user to landlord if needed.
3. Listing starts as `pending`.
4. Admin reviews listing.
5. Admin approves, rejects, features, or archives.
6. Only `approved` listings are publicly visible.

## Admin UI

The frontend includes `/admin`, protected by client role checks for UX and backend role guards for security.

## Security Rules

- Admin role comes from MongoDB, not from frontend input.
- Owners cannot approve their own listing.
- Rejection requires a reason.
- Approval stores `approvedAt` and `approvedBy`.
