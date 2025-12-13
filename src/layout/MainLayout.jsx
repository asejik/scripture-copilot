import React, { useState, useEffect } from 'react';
import AudioMonitor from '../features/audio/AudioMonitor';
import SongDashboard from '../features/songs/SongDashboard';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('scripture');
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);

  // Global Wake Lock (Moved from AudioMonitor so it works in Songs mode too)
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); setIsWakeLockActive(true); wakeLock.addEventListener('release', () => setIsWakeLockActive(false)); }} catch (err) { setIsWakeLockActive(false); }
    };
    requestWakeLock();
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible' && !wakeLock) requestWakeLock(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { if (wakeLock) wakeLock.release(); document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">

      {/* --- GLOBAL HEADER --- */}
      <header className="bg-slate-900 border-b border-slate-800 p-3 shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* BRANDING */}
          <div className="flex items-center gap-3 w-1/4">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-slate-100">Scripture Copilot</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Projection System</p>
            </div>
          </div>

          {/* CENTER TABS */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('scripture')}
              className={`px-8 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'scripture' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              📖 Scriptures
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`px-8 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'songs' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              🎵 Songs
            </button>
          </div>

          {/* STATUS AREA */}
          <div className="w-1/4 flex justify-end items-center gap-3">
             {isWakeLockActive && (
                <span className="flex items-center gap-1 text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50">
                  🔒 Awake
                </span>
             )}
             <div className="h-2 w-2 rounded-full bg-slate-700" title="System Ready"></div>
          </div>
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-300">
          {activeTab === 'scripture' ? <AudioMonitor /> : <SongDashboard />}
        </div>
      </main>

    </div>
  );
};

export default MainLayout;