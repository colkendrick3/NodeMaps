// Builds the self-contained HTML document rendered inside the map WebView.
//
// Leaflet's JS/CSS are embedded as base64 data: URIs (see leafletAssets.js)
// rather than fetched from a CDN, so the only network requests this page
// ever makes are for OSM tile images -- consistent with CLAUDE.md's "OSM
// tiles + Overpass API only" constraint. Overpass queries themselves stay
// on the React Native side (services/CameraDataService.js); this page only
// renders whatever nodes it's given via setCameraNodes().
import { LEAFLET_CSS_BASE64, LEAFLET_JS_BASE64 } from './leafletAssets';

export function buildLeafletMapHtml({ tileUrlTemplate, initialCenter, initialZoom }) {
  const [lat, lon] = initialCenter;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="data:text/css;base64,${LEAFLET_CSS_BASE64}" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #1d1d1d; }
    /* Approximate a dark map from light OSM raster tiles. */
    .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.9) saturate(0.8); }
    .leaflet-control-attribution { background: #1d1d1dcc !important; color: #8a8a8a !important; }
    .leaflet-control-attribution a { color: #8a8a8a !important; }
    .node-popup { font-family: sans-serif; font-size: 13px; color: #1d1d1d; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="data:text/javascript;base64,${LEAFLET_JS_BASE64}"></script>
  <script>
    function post(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }

    var map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([${lat}, ${lon}], ${initialZoom});

    L.tileLayer('${tileUrlTemplate}', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    var userMarker = null;

    function postRegion() {
      var b = map.getBounds();
      post({
        type: 'regionChange',
        bounds: {
          minLat: b.getSouth(),
          maxLat: b.getNorth(),
          minLon: b.getWest(),
          maxLon: b.getEast(),
        },
      });
    }

    map.on('moveend', postRegion);

    window.setCameraNodes = function (nodes) {
      markersLayer.clearLayers();
      nodes.forEach(function (node) {
        var label = escapeHtml(node.surveillanceType || 'Camera');
        L.circleMarker([node.lat, node.lon], {
          radius: 7,
          weight: 2,
          color: '#ffffff',
          fillColor: '#ff6b35',
          fillOpacity: 1,
        })
          .bindPopup('<div class="node-popup"><strong>' + label + '</strong><br/>OSM node ' + node.osmId + '</div>')
          .addTo(markersLayer);
      });
    };

    window.setUserLocation = function (lat, lon) {
      if (userMarker) {
        userMarker.setLatLng([lat, lon]);
        return;
      }
      userMarker = L.circleMarker([lat, lon], {
        radius: 8,
        weight: 3,
        color: '#ffffff',
        fillColor: '#4285f4',
        fillOpacity: 1,
      }).addTo(map);
    };

    postRegion();
  </script>
</body>
</html>`;
}
