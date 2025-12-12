import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture, fontSize, theme, layoutMode, textAlign, aspectRatio } = useProjection();

  const [dynamicFontSize, setDynamicFontSize] = useState(fontSize);
  const textRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    setDynamicFontSize(fontSize);
  }, [liveScripture, fontSize]);

  useLayoutEffect(() => {
    if (!textRef.current || !boxRef.current) return;

    const checkFit = () => {
      const text = textRef.current;
      const box = boxRef.current;
      let iterations = 0;
      let currentSize = fontSize;

      while (
        (text.scrollHeight > box.clientHeight || text.scrollWidth > box.clientWidth) &&
        currentSize > 20 &&
        iterations < 100
      ) {
        currentSize -= 2;
        text.style.fontSize = `${currentSize}px`;
        iterations++;
      }
    };

    textRef.current.style.fontSize = `${fontSize}px`;
    checkFit();
  }, [liveScripture, fontSize, layoutMode, aspectRatio, textAlign]);

  const isLowerThird = layoutMode === 'LOWER_THIRD';
  const isUltraWide = aspectRatio === '12:5';

  // --- DYNAMIC BOUNDARIES ---
  const wrapperStyle = isLowerThird
    ? {
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        // If UltraWide, make the lower third strip a bit shorter/sleeker?
        // Or keep it standard. Let's keep it standard 280px for now.
        height: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 50
      }
    : {
        // CENTER MODE LOGIC
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',

        // 12:5 = Wider width, Shorter Height
        width: isUltraWide ? '95%' : '85%',
        height: isUltraWide ? '60%' : '80%', // 60% mimics 1920x800 safe area inside 1080p

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        zIndex: 50
      };

  const bodyStyle = isLowerThird
    ? {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        overflow: 'hidden'
      }
    : {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        // Adjust padding for ultra-wide to utilize horizontal space
        padding: isUltraWide ? '40px 60px' : '60px 40px',
        textAlign: 'center',
        overflow: 'hidden'
      };

  return (
    <div
        className="min-h-screen w-full relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: theme.backgroundColor }}
    >
      {!liveScripture ? (
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">
          ● Projector Ready ({layoutMode} - {aspectRatio}). Waiting for input...
        </div>
      ) : (
        <div style={wrapperStyle} className="animate-in zoom-in-95 fade-in duration-300">

          <div className={`
              bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400 relative z-20
              ${!isLowerThird && "mx-auto"}
          `}>
            {liveScripture.reference}
          </div>

          <div
            ref={boxRef}
            className={`
                bg-slate-900/95 shadow-2xl border border-slate-700 w-full relative z-10
                ${isLowerThird ? "rounded-tr-xl rounded-tl-xl rounded-bl-xl rounded-br-xl" : "rounded-xl"}
                 rounded-xl
            `}
            style={bodyStyle}
          >
            <p
                ref={textRef}
                className="font-serif leading-tight drop-shadow-md transition-opacity duration-100 ease-out"
                style={{
                    color: theme.textColor,
                    width: '100%',
                    wordWrap: 'break-word',
                    margin: 0,
                    textAlign: textAlign
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