# Radius Search

Rently stores listing coordinates as GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [79.8612, 6.9271]
}
```

Coordinates are `[longitude, latitude]`, matching MongoDB GeoJSON requirements.

## Endpoint

```http
GET /api/listings?lat=6.9271&lng=79.8612&radiusKm=10
```

## Backend Behavior

- Validates latitude, longitude, and radius.
- Caps radius at 100km.
- Uses `$geoNear` with the `2dsphere` index.
- Returns `distanceKm` when radius search is used.
- Combines radius with public filters such as city, type, price, bedrooms, bathrooms, verified, and featured.

## Frontend

The listing filter bar includes latitude, longitude, radius, and a Colombo preset. Future UX can replace manual coordinates with map bounds, browser geolocation, or an address geocoder.
