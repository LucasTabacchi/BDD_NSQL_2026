import React from 'react';
import './GroupSelector.css';

const GROUP_ICONS = {
  cervecerias: '🍺',
  universidades: '🎓',
  farmacias: '💊',
  emergencias: '🚨',
  supermercados: '🛒',
};

export default function GroupSelector({ groups, selected, onSelect }) {
  return (
    <div className="group-selector" role="group" aria-label="Grupo de interés">
      {groups.map(({ id, label }) => (
        <button
          key={id}
          className={`group-chip ${selected === id ? 'selected' : ''}`}
          onClick={() => onSelect(id)}
          aria-pressed={selected === id}
        >
          <span className="group-chip-icon" aria-hidden="true">{GROUP_ICONS[id] || '📍'}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
