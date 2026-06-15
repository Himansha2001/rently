# Database Models

MongoDB is the primary database.

## User

Stores Firebase-linked user profiles and marketplace roles.

## Listing

Stores property content, price, address, GeoJSON location, amenities, S3-backed image URLs, contact details, moderation status, and approval metadata. Listing images are uploaded to object storage first, then the returned URLs are stored in `imageUrls`.

Important indexes:

- `location: 2dsphere` declared once on the listing schema
- text index across title, description, address, city, district
- status/filter indexes
- owner/status index

## Conversation

Stores listing-specific conversations between renter and landlord. Responses include participant display names and only the current viewer's unread count.

## Message

Stores individual messages in conversations. Message reads are paginated with `page` and `limit` so history is not silently truncated.

## SavedListing

Stores a user/listing bookmark with a unique compound index.

## Moderation Metadata

Listing documents hold `status`, `rejectionReason`, `approvedAt`, and `approvedBy`. A separate audit collection can be added later if regulatory or operational review requires immutable moderation logs.
