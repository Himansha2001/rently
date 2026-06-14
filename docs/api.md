# API Reference

All authenticated requests use:

```http
Authorization: Bearer <firebase_id_token>
```

## Auth

- `POST /api/auth/session`: verify Firebase token and create/update MongoDB user profile.
- `GET /api/auth/me`: return current MongoDB profile.
- `PATCH /api/auth/me`: update profile fields. Roles are not accepted.

## Listings

- `GET /api/listings`: public approved listing search. Authenticated users receive sensitive contact fields.
- `GET /api/listings/:id`: listing detail. Public users only see approved sanitized data.
- `GET /api/listings/mine`: authenticated user's listings.
- `POST /api/listings`: create pending listing and promote user to landlord.
- `PATCH /api/listings/:id`: owner edits listing; edited listings return to pending review.
- `DELETE /api/listings/:id`: owner archives listing.
- `POST /api/listings/:id/view`: increment approved listing view count.

## Listing Search Query Params

- `query`
- `city`
- `propertyType`
- `minPrice`
- `maxPrice`
- `bedrooms`
- `bathrooms`
- `verified`
- `featured`
- `lat`
- `lng`
- `radiusKm`
- `page`
- `limit`

Radius is capped at 100km by backend validation.

## Admin

Admin role required.

- `GET /api/admin/listings?status=pending`
- `PATCH /api/admin/listings/:id/approve`
- `PATCH /api/admin/listings/:id/reject`
- `PATCH /api/admin/listings/:id/feature`
- `PATCH /api/admin/listings/:id/archive`

## Messaging

Authentication required.

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `PATCH /api/conversations/:id/read`

## Saved Listings

Authentication required.

- `GET /api/me/saved-listings`
- `POST /api/me/saved-listings/:listingId`
- `DELETE /api/me/saved-listings/:listingId`
