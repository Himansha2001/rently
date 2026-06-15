# Deployment View

```mermaid
flowchart LR
  User["Browser user"] --> CDN["Static frontend hosting"]
  CDN --> API["Node/NestJS API hosting"]
  API --> Mongo["MongoDB Atlas"]
  API --> FirebaseAuth["Firebase Auth"]
  API --> Storage["S3-compatible object storage"]
  Storage --> CDNMedia["Public media URL / CDN"]
  API -. future optional .-> MySQL["MySQL for justified reporting/accounting"]
```
