import React, { useState } from 'react';
import Navbar from './components/Navbar';
import NearbyPage from './pages/NearbyPage';
import AddPlacePage from './pages/AddPlacePage';
import ManagePage from './pages/ManagePage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('nearby');

  return (
    <div className="app-shell">
      <Navbar active={page} onNav={setPage} />
      <main className="app-main">
        {page === 'nearby' && <NearbyPage />}
        {page === 'add' && <AddPlacePage />}
        {page === 'manage' && <ManagePage />}
      </main>
    </div>
  );
}
