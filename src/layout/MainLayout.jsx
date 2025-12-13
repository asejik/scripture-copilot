import React, { useState, useEffect } from 'react';
import { useProjection } from '../context/ProjectionContext';
import AudioMonitor from '../features/audio/AudioMonitor';
import SongDashboard from '../features/songs/SongDashboard';
import SettingsDashboard from '../features/settings/SettingsDashboard';

const MainLayout = () => {
  const { clearProjection } = useProjection();
  const [activeTab, setActiveTab] = useState('scripture');
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans overflow-hidden">

      {/* --- GLOBAL HEADER --- */}
      <header className="bg-slate-900 border-b border-slate-800 p-2 shadow-md z-50 shrink-0">
        <div className="w-full px-4 flex justify-between items-center">

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
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'scripture' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              📖 Scriptures
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'songs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              🎵 Songs
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'settings' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
              `}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* STATUS AREA & GLOBAL CLEAR */}
          <div className="w-1/4 flex justify-end items-center gap-3">
             <button
                onClick={clearProjection}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded shadow-lg transition-transform active:scale-95 animate-in fade-in border border-red-400"
             >
                ✖ CLEAR PROJECTOR
             </button>

             {isWakeLockActive && (
                <span className="flex items-center gap-1 text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50" title="Wake Lock Active">
                  🔒
                </span>
             )}
          </div>
        </div>
      </header>

      {/* --- CONTENT AREA (FULL WIDTH) --- */}
      <main className="flex-1 p-4 overflow-hidden w-full relative">
        <div className="w-full h-full animate-in fade-in duration-300">
          {activeTab === 'scripture' && <AudioMonitor />}
          {activeTab === 'songs' && <SongDashboard />}
          {activeTab === 'settings' && <SettingsDashboard />}
        </div>
      </main>

    </div>
  );
};

export default MainLayout;