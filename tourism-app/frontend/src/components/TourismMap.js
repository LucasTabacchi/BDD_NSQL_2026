import React, { useEffect, useRef } from 'react';
import './TourismMap.css';

// Load Leaflet dynamically from CDN
function ensureLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }

    // CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

export default function TourismMap({ userLat, userLon, activePlace }) {
  const mapRef = useRef(null);       // DOM node
  const leafletMap = useRef(null);   // L.Map instance
  const routeLayer = useRef(null);   // current polyline
  const markerUser = useRef(null);
  const markerPlace = useRef(null);

  // Initialize map once
  useEffect(() => {
    ensureLeaflet().then((L) => {
      if (leafletMap.current) return;

      leafletMap.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([userLat, userLon], 14);

      leafletMap.current.createPane('routePane');
      leafletMap.current.getPane('routePane').style.zIndex = '450';

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(leafletMap.current);

      // User marker (blue pulsing)
      const userIcon = L.divIcon({
        className: '',
        html: `<div class="map-marker-user"><div class="map-marker-user-pulse"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      markerUser.current = L.marker([userLat, userLon], { icon: userIcon })
        .addTo(leafletMap.current)
        .bindPopup('<strong>Tu ubicación</strong>');

      // Leaflet can mis-measure the container on first paint after SPA hydration.
      setTimeout(() => {
        leafletMap.current?.invalidateSize();
      }, 0);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [userLat, userLon]);

  useEffect(() => {
    ensureLeaflet().then(() => {
      const map = leafletMap.current;
      if (!map || !markerUser.current) return;

      markerUser.current.setLatLng([userLat, userLon]);

      if (!activePlace) {
        map.setView([userLat, userLon], 14, { animate: false });
      }
    });
  }, [userLat, userLon, activePlace]);

  // React to activePlace changes — update route
  useEffect(() => {
    ensureLeaflet().then((L) => {
      const map = leafletMap.current;
      if (!map) return;

      // Remove previous route + destination marker
      if (routeLayer.current) { map.removeLayer(routeLayer.current); routeLayer.current = null; }
      if (markerPlace.current) { map.removeLayer(markerPlace.current); markerPlace.current = null; }

      if (!activePlace) {
        // No place selected — just center on user
        map.setView([userLat, userLon], 14, { animate: true });
        return;
      }

      const placeLat = parseFloat(activePlace.latitude);
      const placeLon = parseFloat(activePlace.longitude);

      // Destination marker (red pin)
      const placeIcon = L.divIcon({
        className: '',
        html: `<div class="map-marker-place"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      markerPlace.current = L.marker([placeLat, placeLon], { icon: placeIcon })
        .addTo(map)
        .bindPopup(`<strong>${activePlace.name}</strong>${activePlace.description ? '<br>' + activePlace.description : ''}`)
        .openPopup();

      // Straight-line route
      routeLayer.current = L.polyline(
        [[userLat, userLon], [placeLat, placeLon]],
        {
          className: 'tourism-route-line',
          color: '#38bdf8',
          weight: 4,
          dashArray: '10 8',
          opacity: 1,
          pane: 'routePane',
          renderer: L.svg(),
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(map);

      routeLayer.current.bringToFront();

      // Fit both points with padding
      map.fitBounds(
        [[userLat, userLon], [placeLat, placeLon]],
        { padding: [48, 48], animate: true, duration: 0.6 }
      );

      map.invalidateSize();
    });
  }, [activePlace, userLat, userLon]);

  return (
    <div className="tourism-map-wrapper">
      <div className="tourism-map-header">
        <span className="tourism-map-label">
          {activePlace
            ? `Trayecto → ${activePlace.name}`
            : 'Seleccioná un lugar para ver el trayecto'}
        </span>
        {activePlace && (
          <span className="tourism-map-hint">Hacé clic en "Ver distancia exacta" de otra tarjeta para cambiar</span>
        )}
      </div>
      <div ref={mapRef} className="tourism-map" aria-label="Mapa de trayecto" />
    </div>
  );
}
