import React from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture, fontSize } = useProjection(); // Get fontSize

  return (
    <div className="min-h-screen w-full flex flex-col justify-end p-12 pb-20 bg-[#00b140]">

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

          {/* Verse Body with Dynamic Font Size */}
          <div className="bg-slate-900/95 text-white p-8 rounded-b-xl rounded-tr-xl shadow-2xl border border-slate-700">
            <p
                className="font-serif leading-snug drop-shadow-md transition-all duration-300 ease-out"
                style={{ fontSize: `${fontSize}px` }} // DYNAMIC STYLE
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