# Deployment Notes

## Recommended MVP Deployment

- React frontend: static hosting such as Vercel, Netlify, or the same platform hosting the API.
- NestJS API: Node-capable platform with environment variables and outbound MongoDB/Firebase Admin access.
- MongoDB: MongoDB Atlas production cluster.
- Firebase: Authentication only.
- Listing images: S3-compatible object storage such as AWS S3, Cloudflare R2, or Backblaze B2.

## Required Production Controls

- Use strong `CORS_ORIGIN`.
- Use managed secrets, never committed `.env`.
- Configure MongoDB network access securely.
- Enable MongoDB backups.
- Add monitoring and error tracking.
- Keep API rate limiting enabled; `POST /api/listings/:id/view` has stricter throttling because it is public.
- Configure S3 bucket/object permissions so uploads are private to server credentials and only intended public URLs are exposed.
- Ensure uploaded images are served from the configured `S3_PUBLIC_BASE_URL` or equivalent CDN/domain.
- Create/verify MongoDB indexes during deployment because Mongoose `autoIndex` is disabled when `NODE_ENV=production`.
- Add CI for frontend build and server build.

## Not Used

- Firestore
- Firebase Storage
- Firebase Realtime Database
- Firebase Cloud Functions for marketplace data
- MySQL
