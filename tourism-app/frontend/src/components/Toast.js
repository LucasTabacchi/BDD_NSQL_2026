import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <span className="toast-icon">
        {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      </span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar notificación">
        <X size={14} />
      </button>
    </div>
  );
}
