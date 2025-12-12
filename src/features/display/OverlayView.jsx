import React from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture, fontSize, theme, layoutMode } = useProjection();

  // Define styles based on mode
  const isLowerThird = layoutMode === 'LOWER_THIRD';

  const containerClasses = isLowerThird
    ? "justify-end p-12 pb-20 items-start" // Bottom Aligned
    : "justify-center items-center p-20";  // Center Aligned (works for 1920x800 & 1920x1080)

  const textAlignment = isLowerThird ? "text-left" : "text-center";
  const maxWidthClass = isLowerThird ? "max-w-6xl" : "max-w-5xl";

  return (
    <div
        className={`min-h-screen w-full flex flex-col transition-all duration-500 ${containerClasses}`}
        style={{ backgroundColor: theme.backgroundColor }}
    >

      {!liveScripture ? (
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">
          ● Projector Ready ({layoutMode}). Waiting for input...
        </div>
      ) : (
        <div className={`${maxWidthClass} w-full animate-in zoom-in-95 fade-in duration-300`}>

          {/* Reference Header */}
          <div className={`
              bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400
              ${!isLowerThird && "mx-auto block w-fit"} // Center header if in Center Mode
          `}>
            {liveScripture.reference}
          </div>

          {/* Verse Body */}
          <div className={`
              bg-slate-900/95 p-8 rounded-b-xl shadow-2xl border border-slate-700
              ${isLowerThird ? "rounded-tr-xl" : "rounded-t-xl"} // Rounded corners adjustment
          `}>
            <p
                className={`font-serif leading-snug drop-shadow-md transition-all duration-300 ease-out ${textAlignment}`}
                style={{
                    fontSize: `${fontSize}px`,
                    color: theme.textColor
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