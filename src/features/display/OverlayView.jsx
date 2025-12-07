import React from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture } = useProjection();

  // Standard Chroma Key Green background
  // This confirms the router found the page
  return (
    <div className="min-h-screen w-full flex flex-col justify-end p-12 pb-20 bg-[#00b140]">

      {!liveScripture ? (
        // IDLE STATE: Show this when nothing is projected
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">
          ● Projector Ready. Waiting for input...
        </div>
      ) : (
        // ACTIVE STATE: Show the scripture
        <div className="max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Reference Header */}
          <div className="bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400">
            {liveScripture.reference}
          </div>

          {/* Verse Body */}
          <div className="bg-slate-900/95 text-white p-8 rounded-b-xl rounded-tr-xl shadow-2xl border border-slate-700">
            <p className="text-4xl font-serif leading-snug drop-shadow-md">
              {liveScripture.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverlayView;