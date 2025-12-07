import React from 'react';
import AudioMonitor from './features/audio/AudioMonitor';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Scripture Copilot</h1>
        <p className="text-slate-400">AI-Powered Church Presentation Assistant</p>
      </header>

      <main className="w-full">
        <AudioMonitor />
      </main>
    </div>
  );
}

export default App;