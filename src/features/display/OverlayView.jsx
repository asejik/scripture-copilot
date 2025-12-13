import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  // NEW: Import textTransform and fontFamily from context
  const { liveScripture, fontSize, theme, layoutMode, textAlign, aspectRatio, textTransform, fontFamily } = useProjection();

  const containerRef = useRef(null);
  const boxRef = useRef(null);

  // ... (Keep existing useLayoutEffect logic exactly the same) ...
  useLayoutEffect(() => {
    if (!containerRef.current || !boxRef.current) return;

    const content = containerRef.current;

    content.style.fontSize = `${fontSize}px`; // Reset first

    let currentSize = fontSize;
    let iterations = 0;

    while (
      (content.scrollHeight > content.clientHeight || content.scrollWidth > content.clientWidth) &&
      currentSize > 16 &&
      iterations < 50
    ) {
      currentSize -= 2;
      content.style.fontSize = `${currentSize}px`;
      iterations++;
    }
  }, [liveScripture, fontSize, layoutMode, aspectRatio, textAlign, textTransform, fontFamily]); // Add new deps

  const isLowerThird = layoutMode === 'LOWER_THIRD';
  const isUltraWide = aspectRatio === '12:5';
  const hasSecondary = !!liveScripture?.secondaryText;

  // ... (Keep styles wrapperStyle and bodyStyle exactly the same) ...
  const wrapperStyle = isLowerThird
    ? { position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '90%', height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 50 }
    : { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: isUltraWide ? '95%' : '85%', height: isUltraWide ? '60%' : '80%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', zIndex: 50 };

  const bodyStyle = isLowerThird
    ? { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', overflow: 'hidden' }
    : { height: '100%', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: isUltraWide ? '40px 60px' : '60px 40px', textAlign: 'center', overflow: 'hidden' };

  return (
    <div className="min-h-screen w-full relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: theme.backgroundColor }}>
      {!liveScripture ? (
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">● Projector Ready ({layoutMode} - {aspectRatio}). Waiting for input...</div>
      ) : (
        <div style={wrapperStyle} className="animate-in zoom-in-95 fade-in duration-300">
          <div className={`bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400 relative z-20 ${!isLowerThird && "mx-auto"}`}>
            {liveScripture.reference}
          </div>

          <div ref={boxRef} className={`bg-slate-900/95 shadow-2xl border border-slate-700 w-full relative z-10 ${isLowerThird ? "rounded-tr-xl rounded-tl-xl rounded-bl-xl rounded-br-xl" : "rounded-xl"}`} style={bodyStyle}>
            <div
                ref={containerRef}
                style={{
                    color: theme.textColor,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    // --- NEW STYLES APPLIED HERE ---
                    textTransform: textTransform,
                    fontFamily: fontFamily,
                    // -------------------------------
                    display: hasSecondary ? 'grid' : 'flex',
                    flexDirection: 'column',
                    justifyContent: isLowerThird ? 'center' : 'flex-start',
                    gridTemplateColumns: hasSecondary ? '1fr 1fr' : undefined,
                    gap: hasSecondary ? '40px' : '0',
                    textAlign: textAlign
                }}
            >
                <div className={`${hasSecondary ? "border-r border-slate-600 pr-5" : "w-full"}`}>
                    {hasSecondary && <div className="text-[0.6em] opacity-70 mb-2 uppercase font-bold tracking-widest text-purple-300">{liveScripture.version}</div>}
                    <p className="font-serif leading-tight drop-shadow-md" style={{ fontFamily: fontFamily }}>{liveScripture.text}</p>
                </div>
                {hasSecondary && (
                    <div className="pl-5">
                        <div className="text-[0.6em] opacity-70 mb-2 uppercase font-bold tracking-widest text-purple-300">{liveScripture.secondaryVersion}</div>
                        <p className="font-serif leading-tight drop-shadow-md opacity-90" style={{ fontFamily: fontFamily }}>{liveScripture.secondaryText}</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OverlayView;