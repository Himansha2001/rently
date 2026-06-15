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

All MongoDB ObjectId route parameters are validated before reaching Mongoose. Invalid IDs return a safe `400 Bad Request`.

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

## Uploads

Authentication required.

- `POST /api/uploads/listing-images`

Request: `multipart/form-data` with field name `images`.

Rules:

- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
- Max size: 5MB per image.
- Max count: 10 images.
- Storage target: S3-compatible object storage, not Firebase Storage.

Response:

```json
{
  "imageUrls": ["https://cdn.example.com/listing-images/user/year/month/file.webp"],
  "urls": ["https://cdn.example.com/listing-images/user/year/month/file.webp"]
}
```

## Admin

Admin role required.

- `GET /api/admin/listings?status=pending&page=1&limit=50`
- `PATCH /api/admin/listings/:id/approve`
- `PATCH /api/admin/listings/:id/reject`
- `PATCH /api/admin/listings/:id/feature`
- `PATCH /api/admin/listings/:id/archive`

Admin list response is paginated:

```json
{
  "items": [],
  "page": 1,
  "limit": 50,
  "total": 0
}
```

## Messaging

Authentication required.

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages?page=1&limit=50`
- `POST /api/conversations/:id/messages`
- `PATCH /api/conversations/:id/read`

Message list response is paginated:

```json
{
  "items": [],
  "page": 1,
  "limit": 50,
  "total": 0
}
```

Conversation responses include participant display names. `unreadBy` only includes unread data for the current viewer.

## Saved Listings

Authentication required.

- `GET /api/me/saved-listings`
- `POST /api/me/saved-listings/:listingId`
- `DELETE /api/me/saved-listings/:listingId`
