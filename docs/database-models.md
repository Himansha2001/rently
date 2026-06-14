# Database Models

MongoDB is the primary database.

## User

Stores Firebase-linked user profiles and marketplace roles.

## Listing

Stores property content, price, address, GeoJSON location, amenities, image URLs, contact details, moderation status, and approval metadata.

Important indexes:

- `location: 2dsphere`
- text index across title, description, address, city, district
- status/filter indexes
- owner/status index

## Conversation

Stores listing-specific conversations between renter and landlord.

## Message

Stores individual messages in conversations.

## SavedListing

Stores a user/listing bookmark with a unique compound index.

## Moderation Metadata

Listing documents hold `status`, `rejectionReason`, `approvedAt`, and `approvedBy`. A separate audit collection can be added later if regulatory or operational review requires immutable moderation logs.
