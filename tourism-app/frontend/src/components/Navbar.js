import React from 'react';
import { MapPin, PlusCircle, List } from 'lucide-react';
import './Navbar.css';

const links = [
  { id: 'nearby', label: 'Explorar', Icon: MapPin },
  { id: 'add', label: 'Agregar', Icon: PlusCircle },
  { id: 'manage', label: 'Gestionar', Icon: List },
];

export default function Navbar({ active, onNav }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-logo">🗺</span>
          <span className="navbar-title">TurismoGeo</span>
        </div>
        <nav className="navbar-links" role="navigation" aria-label="Menú principal">
          {links.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-btn ${active === id ? 'active' : ''}`}
              onClick={() => onNav(id)}
              aria-current={active === id ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
