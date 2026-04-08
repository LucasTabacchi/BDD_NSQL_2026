import React, { useLayoutEffect, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import NearbyPage from './pages/NearbyPage';
import AddPlacePage from './pages/AddPlacePage';
import ManagePage from './pages/ManagePage';
import './App.css';

const PAGE_STORAGE_KEY = 'tourism-active-page';
const VALID_PAGES = new Set(['nearby', 'add', 'manage']);

export default function App() {
  const [page, setPage] = useState(() => {
    const savedPage = window.localStorage.getItem(PAGE_STORAGE_KEY);
    return VALID_PAGES.has(savedPage) ? savedPage : 'nearby';
  });

  useLayoutEffect(() => {
    document.body.classList.add('app-ready');
    return () => {
      document.body.classList.remove('app-ready');
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PAGE_STORAGE_KEY, page);
  }, [page]);

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
