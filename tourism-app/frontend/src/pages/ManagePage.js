import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import GroupSelector from '../components/GroupSelector';
import Toast from '../components/Toast';
import { getGroups, getPlaces, deletePlace } from '../api';
import './ManagePage.css';

export default function ManagePage() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    getGroups().then(r => {
      setGroups(r.data);
      setSelected(r.data[0]?.id || '');
    });
  }, []);

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const r = await getPlaces(selected);
      setPlaces(r.data);
    } catch {
      setToast({ message: 'Error al cargar los lugares.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (name) => {
    try {
      await deletePlace(selected, name);
      setToast({ message: `"${name}" eliminado.`, type: 'success' });
      setPlaces(prev => prev.filter(p => p.name !== name));
    } catch {
      setToast({ message: 'Error al eliminar el lugar.', type: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  const GROUP_ICONS = {
    cervecerias: '🍺', universidades: '🎓', farmacias: '💊',
    emergencias: '🚨', supermercados: '🛒',
  };

  return (
    <div className="manage-page">
      <div className="page-header">
        <h1 className="page-title">Gestionar lugares</h1>
        <p className="page-sub">Visualizá y eliminá puntos de interés registrados.</p>
      </div>

      <div className="manage-card">
        <div className="section-label">Grupo de interés</div>
        <GroupSelector groups={groups} selected={selected} onSelect={setSelected} />

        <div className="manage-toolbar">
          <span className="manage-count">
            {loading ? 'Cargando…' : `${places.length} lugar${places.length !== 1 ? 'es' : ''}`}
          </span>
          <button className="btn-refresh" onClick={load} disabled={loading} aria-label="Actualizar lista">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="spin" />
          </div>
        ) : places.length === 0 ? (
          <div className="empty-state">
            <p>No hay lugares registrados en este grupo.</p>
          </div>
        ) : (
          <ul className="places-list" aria-label="Lista de lugares">
            {places.map(p => (
              <li key={p.name} className="place-row">
                <span className="place-row-icon" aria-hidden="true">{GROUP_ICONS[selected] || '📍'}</span>
                <div className="place-row-info">
                  <span className="place-row-name">{p.name}</span>
                  {p.description && <span className="place-row-desc">{p.description}</span>}
                  <span className="place-row-coords">
                    {Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}
                  </span>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => setConfirmDelete(p.name)}
                  aria-label={`Eliminar ${p.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
          <div className="modal">
            <div className="modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h2 className="modal-title">¿Eliminar lugar?</h2>
            <p className="modal-body">
              Vas a eliminar <strong>"{confirmDelete}"</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(confirmDelete)}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
