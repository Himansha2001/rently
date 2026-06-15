# Rently Technical Documentation

Rently is a production marketplace for Sri Lanka rental properties. This documentation covers the backend foundation added for Firebase Authentication, MongoDB application data, radius search, listing moderation, messaging, saved homes, and frontend integration.

## Documents

- [Architecture](./architecture.md)
- [Backend setup](./backend-setup.md)
- [API reference](./api.md)
- [Auth and roles](./auth-and-roles.md)
- [Database models](./database-models.md)
- [Radius search](./radius-search.md)
- [Admin moderation](./admin-moderation.md)
- [Deployment notes](./deployment-notes.md)
- [Diagrams](./diagrams)

## Core Decisions

- Firebase is used for identity only.
- MongoDB is the primary application database.
- Listing images use S3-compatible object storage through the backend API.
- Firestore, Firebase Storage, Realtime Database, and Cloud Functions are not used for app data.
- New listings are pending until an admin approves them.
- Sensitive contact details require authentication.
- Radius search uses MongoDB geospatial queries and a `2dsphere` index.
