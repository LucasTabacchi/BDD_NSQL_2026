import React, { useState, useEffect, useCallback } from 'react';
import { Locate, Search, RefreshCw } from 'lucide-react';
import GroupSelector from '../components/GroupSelector';
import PlaceCard from '../components/PlaceCard';
import TourismMap from '../components/TourismMap';
import Toast from '../components/Toast';
import { getGroups, getNearby, getDistance } from '../api';
import './NearbyPage.css';

export default function NearbyPage() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState(5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [distances, setDistances] = useState({});
  const [toast, setToast] = useState(null);
  const [activePlace, setActivePlace] = useState(null);

  useEffect(() => {
    getGroups().then(r => {
      setGroups(r.data);
      setSelected(r.data[0]?.id || '');
    });
  }, []);

  const geolocate = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocalización no disponible en este navegador.', type: 'error' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
        setLocating(false);
        setToast({ message: 'Ubicación obtenida correctamente.', type: 'success' });
      },
      () => {
        setLocating(false);
        setToast({ message: 'No se pudo obtener la ubicación.', type: 'error' });
      }
    );
  };

  const search = async () => {
    if (!lat || !lon || !selected) {
      setToast({ message: 'Completá la ubicación y elegí un grupo.', type: 'error' });
      return;
    }
    setLoading(true);
    setDistances({});
    setActivePlace(null);
    try {
      const r = await getNearby(selected, parseFloat(lat), parseFloat(lon), radius);
      setResults(r.data);
      if (r.data.places.length === 0) {
        setToast({ message: `Sin resultados en ${radius} km para ese grupo.`, type: 'error' });
      }
    } catch {
      setToast({ message: 'Error al consultar la API.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetDistance = useCallback(async (placeName) => {
    // Find the place object from results
    const place = results?.places.find(p => p.name === placeName);
    setActivePlace(place || null);
    try {
      const r = await getDistance(selected, parseFloat(lat), parseFloat(lon), placeName);
      setDistances(prev => ({ ...prev, [placeName]: r.data.distance_km }));
    } catch {
      setToast({ message: 'Error al calcular distancia.', type: 'error' });
    }
  }, [selected, lat, lon, results]);

  return (
    <div className="nearby-page">
      <div className="page-header">
        <h1 className="page-title">Explorar puntos de interés</h1>
        <p className="page-sub">Encontrá lugares dentro de un radio de tu ubicación.</p>
      </div>

      <div className="search-card">
        <div className="location-row">
          <div className="input-group">
            <label htmlFor="lat">Latitud</label>
            <input id="lat" type="number" step="any" placeholder="-32.000000"
              value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="lon">Longitud</label>
            <input id="lon" type="number" step="any" placeholder="-60.000000"
              value={lon} onChange={e => setLon(e.target.value)} />
          </div>
          <div className="input-group input-group-sm">
            <label htmlFor="radius">Radio (km)</label>
            <input id="radius" type="number" min="0.1" max="50" step="0.5"
              value={radius} onChange={e => setRadius(parseFloat(e.target.value))} />
          </div>
          <button className="btn-locate" onClick={geolocate} disabled={locating}
            title="Usar mi ubicación actual" aria-label="Obtener ubicación automáticamente">
            <Locate size={18} className={locating ? 'spin' : ''} />
            <span>{locating ? 'Localizando…' : 'Mi ubicación'}</span>
          </button>
        </div>

        <div className="section-label">Grupo de interés</div>
        <GroupSelector groups={groups} selected={selected} onSelect={setSelected} />

        <button className="btn-primary" onClick={search} disabled={loading}>
          {loading
            ? <><RefreshCw size={16} className="spin" /> Buscando…</>
            : <><Search size={16} /> Buscar cercanos</>}
        </button>
      </div>

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h2>{results.label}</h2>
            <span className="results-count">
              {results.places.length} resultado{results.places.length !== 1 ? 's' : ''}
            </span>
          </div>
          {results.places.length === 0 ? (
            <div className="empty-state">
              <p>No hay lugares en {results.radius_km} km.</p>
            </div>
          ) : (
            <>
              <div className="places-grid">
                {results.places.map(p => (
                  <PlaceCard
                    key={p.name}
                    place={p}
                    onGetDistance={handleGetDistance}
                    distanceResult={distances[p.name]}
                    isActive={activePlace?.name === p.name}
                  />
                ))}
              </div>
              <TourismMap
                userLat={parseFloat(lat)}
                userLon={parseFloat(lon)}
                activePlace={activePlace}
              />
            </>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
