import React, { useState } from 'react';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { CustomerPortal } from './pages/CustomerPortal.js';
import { AdminPortal } from './pages/AdminPortal.js';
import { ApplicationStatusLookup } from './pages/ApplicationStatusLookup.js';

export function App() {
  const [currentView, setCurrentView] = useState<'portal' | 'admin' | 'lookup'>('portal');
  const [lookupAppId, setLookupAppId] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('dtn_admin_token'));
  });

  const handleNavigate = (view: 'portal' | 'admin' | 'lookup') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackApplication = (appId: string) => {
    setLookupAppId(appId);
    setCurrentView('lookup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'portal' && (
          <CustomerPortal onTrackApplication={handleTrackApplication} />
        )}

        {currentView === 'lookup' && (
          <ApplicationStatusLookup
            initialAppId={lookupAppId}
            onApplyNew={() => handleNavigate('portal')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPortal />
        )}
      </main>

      {/* Universal Corporate Footer */}
      <Footer />
    </div>
  );
}

export default App;
