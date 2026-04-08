import React, { useState, useEffect } from 'react';
import { PlusCircle, Locate, RefreshCw } from 'lucide-react';
import GroupSelector from '../components/GroupSelector';
import Toast from '../components/Toast';
import { getGroups, addPlace } from '../api';
import './AddPlacePage.css';

const EMPTY = { name: '', latitude: '', longitude: '', description: '' };

export default function AddPlacePage() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getGroups().then(r => {
      setGroups(r.data);
      setSelected(r.data[0]?.id || '');
    });
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const geolocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setToast({ message: 'No se pudo obtener la ubicación.', type: 'error' });
      }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.latitude || !form.longitude) {
      setToast({ message: 'Nombre, latitud y longitud son obligatorios.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await addPlace(selected, {
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        description: form.description,
      });
      setToast({ message: `"${form.name}" agregado correctamente.`, type: 'success' });
      setForm(EMPTY);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al agregar el lugar.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-page">
      <div className="page-header">
        <h1 className="page-title">Agregar lugar</h1>
        <p className="page-sub">Registrá un nuevo punto de interés en un grupo.</p>
      </div>

      <form className="add-card" onSubmit={submit} noValidate>
        <div className="section-label">Grupo de interés</div>
        <GroupSelector groups={groups} selected={selected} onSelect={setSelected} />

        <div className="form-grid">
          <div className="input-group full-width">
            <label htmlFor="pname">Nombre del lugar <span className="required">*</span></label>
            <input id="pname" type="text" placeholder="Ej: Farmacia Central"
              value={form.name} onChange={set('name')} required />
          </div>

          <div className="input-group">
            <label htmlFor="plat">Latitud <span className="required">*</span></label>
            <input id="plat" type="number" step="any" placeholder="-32.123456"
              value={form.latitude} onChange={set('latitude')} required />
          </div>

          <div className="input-group">
            <label htmlFor="plon">Longitud <span className="required">*</span></label>
            <input id="plon" type="number" step="any" placeholder="-60.654321"
              value={form.longitude} onChange={set('longitude')} required />
          </div>

          <div className="input-group full-width">
            <label htmlFor="pdesc">Descripción (opcional)</label>
            <input id="pdesc" type="text" placeholder="Horario, detalles, etc."
              value={form.description} onChange={set('description')} />
          </div>
        </div>

        <div className="add-actions">
          <button type="button" className="btn-locate" onClick={geolocate} disabled={locating}>
            <Locate size={16} className={locating ? 'spin' : ''} />
            {locating ? 'Localizando…' : 'Usar mi ubicación'}
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <><RefreshCw size={16} className="spin" /> Guardando…</>
              : <><PlusCircle size={16} /> Agregar lugar</>}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
