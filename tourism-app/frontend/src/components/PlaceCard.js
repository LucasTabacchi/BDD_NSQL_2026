import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import './PlaceCard.css';

export default function PlaceCard({ place, onGetDistance, distanceResult, isActive }) {
  return (
    <div className={`place-card ${isActive ? 'place-card-active' : ''}`}>
      <div className="place-card-header">
        <div className="place-card-icon">
          <MapPin size={16} aria-hidden="true" />
        </div>
        <div className="place-card-info">
          <h3 className="place-card-name">{place.name}</h3>
          {place.description && (
            <p className="place-card-desc">{place.description}</p>
          )}
        </div>
        {place.distance_km !== undefined && (
          <span className="place-card-dist">{place.distance_km} km</span>
        )}
      </div>
      <div className="place-card-coords">
        <span>Lat: {Number(place.latitude).toFixed(5)}</span>
        <span>Lon: {Number(place.longitude).toFixed(5)}</span>
      </div>
      {onGetDistance && (
        <button className="place-card-btn" onClick={() => onGetDistance(place.name)}>
          <Navigation size={14} aria-hidden="true" />
          Ver distancia exacta
        </button>
      )}
      {distanceResult && (
        <div className="place-card-distance-result">
          <Navigation size={14} />
          <strong>{distanceResult} km</strong> desde tu ubicación
        </div>
      )}
    </div>
  );
}
