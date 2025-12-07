import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AudioMonitor from './features/audio/AudioMonitor';
import OverlayView from './features/display/OverlayView';
import { ProjectionProvider } from './context/ProjectionContext';

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
      <header className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-2">Scripture Copilot</h1>
        <div className="flex gap-4 text-sm">
            <span className="text-slate-400">AI-Powered Church Assistant</span>
            <span className="text-slate-600">|</span>
            {/* Link to open Overlay in new tab */}
            <Link to="/overlay" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                Open Projector View ↗
            </Link>
        </div>
      </header>
      <main className="w-full">
        <AudioMonitor />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ProjectionProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overlay" element={<OverlayView />} />
        </Routes>
      </ProjectionProvider>
    </BrowserRouter>
  );
}

export default App;