import React from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  // 1. Get Theme from Context
  const { liveScripture, fontSize, theme } = useProjection();

  return (
    // 2. Apply Dynamic Background Color
    <div
        className="min-h-screen w-full flex flex-col justify-end p-12 pb-20 transition-colors duration-300"
        style={{ backgroundColor: theme.backgroundColor }}
    >

      {!liveScripture ? (
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">
          ● Projector Ready. Waiting for input...
        </div>
      ) : (
        <div className="max-w-6xl w-full mx-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Reference Header */}
          <div className="bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400">
            {liveScripture.reference}
          </div>

          {/* Verse Body */}
          <div className="bg-slate-900/95 p-8 rounded-b-xl rounded-tr-xl shadow-2xl border border-slate-700">
            <p
                className="font-serif leading-snug drop-shadow-md transition-all duration-300 ease-out"
                style={{
                    fontSize: `${fontSize}px`,
                    color: theme.textColor // 3. Apply Dynamic Text Color
                }}
            >
              {liveScripture.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverlayView;