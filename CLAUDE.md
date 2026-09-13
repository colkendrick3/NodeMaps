# NodeMap — Project Constraints

## Purpose
A privacy-first mobile app that displays publicly-tagged surveillance camera
locations (OpenStreetMap `man_made=surveillance` / `surveillance:type` tags)
and alerts the user locally when they are near one. No user location data
ever leaves the device.

## Stack
- Expo SDK 57 (managed workflow), React Native 0.86, React 19.2
- react-native-webview 13.16 rendering a self-contained Leaflet.js map
  (see tile note below) — not react-native-maps
- expo-location 57 (foreground + background GPS)
- @turf/turf 7 (client-side geospatial math)
- expo-sqlite 57 (local cache of camera nodes)
- expo-haptics 57 (local proximity alerts)

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

## Map Rendering: WebView + Leaflet, not react-native-maps
`react-native-maps`'s `PROVIDER_DEFAULT` renders Google Maps as the base
layer on Android, which requires a Google Maps API key to show anything —
and even with an `<UrlTile>` OSM overlay on top, the Google base layer
still fetches its own tiles from Google's servers underneath, which
violates Hard Constraint #3 (OSM + Overpass only, no other network
destinations).

Instead, `screens/MapScreen.js` renders a `react-native-webview` `<WebView>`
loading a self-contained HTML document (`assets/leafletMapHtml.js`) that
runs Leaflet.js against OSM raster tiles directly — no native map SDK, no
API key, no Google network calls. Leaflet's own JS/CSS are vendored as
base64 data: URIs in `assets/leafletAssets.js` (not fetched from a CDN at
runtime), so the WebView's only network requests are for OSM tile images.
Camera nodes and the user's own position are pushed into the page via
`webviewRef.current.injectJavaScript(...)`; the page reports viewport
bounds back via `window.ReactNativeWebView.postMessage(...)`.

This works in plain Expo Go (react-native-webview is one of Expo Go's
bundled native modules) — `@maplibre/maplibre-react-native` (true vector
tiles) remains the documented fallback if a custom dev client ever becomes
acceptable, but was not chosen since it would break Expo Go compatibility.

## Build/Test/Lint (exact commands)
- `npm run start` — Expo dev server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check, no emit

## Out of scope for Phase 1
- Account system / auth (none — no accounts, period)
- Push notifications
- iOS/Android background task beyond foreground-active proximity checks
