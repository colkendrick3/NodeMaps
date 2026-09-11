# NodeMap — Project Constraints

## Purpose
A privacy-first mobile app that displays publicly-tagged surveillance camera
locations (OpenStreetMap `man_made=surveillance` / `surveillance:type` tags)
and alerts the user locally when they are near one. No user location data
ever leaves the device.

## Stack
- Expo SDK 51 (managed workflow), React Native 0.74
- react-native-maps 1.14 (map rendering — see tile note below)
- expo-location 17 (foreground + background GPS)
- @turf/turf 7 (client-side geospatial math)
- expo-sqlite 14 (local cache of camera nodes)
- expo-haptics (local proximity alerts)

## Hard Constraints (do not violate)
1. **Zero server-side tracking.** No analytics SDK, no crash reporter that
   transmits GPS coordinates, no backend of any kind for user location.
2. **No location logging, ever.** Coordinates may exist in memory and in the
   local SQLite cache (camera nodes only, not user position history).
3. **Outbound network calls are limited to:** (a) fetching OSM tile images,
   (b) querying the public Overpass API for camera nodes in the current
   bounding box. Both are anonymous, unauthenticated, and carry no user
   identifiers.
4. **Data source note:** camera locations come only from OSM's existing
   public tagging (crowd-sourced, openly licensed under ODbL). This app
   does not perform its own surveillance-detection or image recognition.

## Known Technical Note for Step 2
`react-native-maps` does not render OSM *vector* tiles natively — its
default providers are Google Maps / Apple Maps. To get real OSM tiles there
are two real options, and Step 2 needs to pick one explicitly:
- **Raster OSM tiles** via `react-native-maps`'s `<UrlTile>` overlay
  (simplest, works today, tiles are raster PNGs).
- **True vector tiles** via `@maplibre/maplibre-react-native` (a different
  library from `react-native-maps`, heavier setup, needs a config plugin
  and a custom dev client — will not work in plain Expo Go).
This file will be updated once Step 2 confirms which path we're taking.

## Build/Test/Lint (exact commands)
- `npm run start` — Expo dev server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check, no emit

## Out of scope for Phase 1
- Account system / auth (none — no accounts, period)
- Push notifications
- iOS/Android background task beyond foreground-active proximity checks
