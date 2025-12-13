import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture, fontSize, theme, layoutMode, textAlign, aspectRatio, textTransform, fontFamily } = useProjection();

  const containerRef = useRef(null);
  const boxRef = useRef(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !boxRef.current) return;
    const content = containerRef.current;

    content.style.fontSize = `${fontSize}px`;

    let currentSize = fontSize;
    let iterations = 0;

    // Use content scroll/client dimensions to determine fit
    while (
      (content.scrollHeight > content.clientHeight || content.scrollWidth > content.clientWidth) &&
      currentSize > 16 &&
      iterations < 50
    ) {
      currentSize -= 2;
      content.style.fontSize = `${currentSize}px`;
      iterations++;
    }
  }, [liveScripture, fontSize, layoutMode, aspectRatio, textAlign, textTransform, fontFamily]);

  const isLowerThird = layoutMode === 'LOWER_THIRD';
  const hasSecondary = !!liveScripture?.secondaryText;

  // --- FIXED ASPECT RATIO LOGIC ---
  // 16:9 = 1.777, 12:5 = 2.4
  const ratioValue = aspectRatio === '12:5' ? '2.4 / 1' : '16 / 9';

  return (
    <div className="min-h-screen w-full relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'black' }}>
      {!liveScripture ? (
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">● Projector Ready ({layoutMode}). Waiting for input...</div>
      ) : (
        <div
            className="animate-in zoom-in-95 fade-in duration-300 flex flex-col items-center justify-center absolute inset-0 p-10"
            style={{
                justifyContent: isLowerThird ? 'flex-end' : 'center',
                paddingBottom: isLowerThird ? '50px' : '0'
            }}
        >
          {/* THE BOX CONTAINER */}
          <div style={{
              width: '100%',
              maxWidth: isLowerThird ? '95%' : '90%',
              // THIS FORCES THE RATIO MATHEMATICALLY
              aspectRatio: ratioValue,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              maxHeight: '90vh' // Safety prevent overflow
          }}>

            {/* HEADER TAB (Floating above box) */}
            <div
                style={{
                    backgroundColor: theme.headerBackgroundColor || '#581c87',
                    color: theme.headerTextColor || '#ffffff',
                    borderColor: theme.headerBackgroundColor,
                    alignSelf: isLowerThird ? 'flex-start' : 'center', // Align tab left for LT, center for Center
                    marginLeft: isLowerThird ? '0' : 'auto',
                    marginRight: isLowerThird ? '0' : 'auto',
                    marginBottom: '-1px', // Merge border
                    zIndex: 20
                }}
                className="px-8 py-2 rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r relative"
            >
                {liveScripture.reference}
            </div>

            {/* MAIN CONTENT BOX */}
            <div
                ref={boxRef}
                style={{
                    backgroundColor: theme.backgroundColor || '#0f172a',
                    borderColor: '#334155',
                    flex: 1, // Fill the aspect-ratio container
                    position: 'relative',
                    zIndex: 10,
                    overflow: 'hidden'
                }}
                className={`shadow-2xl border w-full ${isLowerThird ? "rounded-tr-xl rounded-tl-xl rounded-bl-xl rounded-br-xl" : "rounded-xl"}`}
            >
                <div
                    ref={containerRef}
                    style={{
                        color: theme.textColor || '#ffffff',
                        width: '100%',
                        height: '100%',
                        padding: aspectRatio === '12:5' ? '30px 50px' : '50px 60px', // Less padding for wide
                        overflow: 'hidden',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        textTransform: textTransform,
                        fontFamily: fontFamily,
                        display: hasSecondary ? 'grid' : 'flex',
                        flexDirection: 'column',
                        justifyContent: isLowerThird ? 'center' : 'flex-start',
                        gridTemplateColumns: hasSecondary ? '1fr 1fr' : undefined,
                        gap: hasSecondary ? '40px' : '0',
                        textAlign: textAlign,
                        alignItems: textAlign === 'center' ? 'center' : 'flex-start'
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
        </div>
      )}
    </div>
  );
};
export default OverlayView;