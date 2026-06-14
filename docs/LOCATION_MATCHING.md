# Location Matching

Trades uses a city-centered service area for marketplace discovery. Companies and jobs store:

- `city` and two-letter `state`
- Google `placeId`
- `formattedLocation`
- `postalCode` when available
- `latitude` and `longitude`

## Current Matching

Google Places Autocomplete standardizes US city selection in signup, company location settings, job posting, and job editing. The server calculates straight-line distance with the Haversine formula and shows companies and published jobs within the user's service radius.

Legacy records without coordinates continue to work through a small city-coordinate fallback. When a known legacy record is loaded, its fallback coordinates are persisted.

Only city-level locations are collected for marketplace matching. Exact private jobsite or company addresses should not be exposed through these public marketplace fields.

## Configuration

Set `GOOGLE_MAPS_API_KEY` in Railway and restrict the key to the production domain and the Maps JavaScript API with Places enabled. Without a key, the interface keeps a standardized fallback list for the initial cities.

## Postgres Migration

The stored `latitude`, `longitude`, and `placeId` fields are intentionally migration-ready. When Trades moves from the private-alpha JSON store to Postgres:

1. Add a PostGIS `geography(Point, 4326)` column for companies and jobs.
2. Backfill points from longitude and latitude.
3. Add GiST indexes.
4. Replace in-process distance filtering with `ST_DWithin`.

Google Routes Matrix can later rank a short list by driving time, but should not replace the cheaper geographic radius query used for the first marketplace filter.
