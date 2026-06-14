# Deployment Notes

## Recommended MVP Deployment

- React frontend: static hosting such as Vercel, Netlify, or the same platform hosting the API.
- NestJS API: Node-capable platform with environment variables and outbound MongoDB/Firebase Admin access.
- MongoDB: MongoDB Atlas production cluster.
- Firebase: Authentication only.

## Required Production Controls

- Use strong `CORS_ORIGIN`.
- Use managed secrets, never committed `.env`.
- Configure MongoDB network access securely.
- Enable MongoDB backups.
- Add monitoring and error tracking.
- Add rate limiting before high traffic launch.
- Add object storage for real listing image uploads.
- Add CI for frontend build and server build.

## Not Used

- Firestore
- Firebase Storage
- Firebase Realtime Database
- Firebase Cloud Functions for marketplace data
- MySQL
