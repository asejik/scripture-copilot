import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture, fontSize, theme, layoutMode } = useProjection();

  // Local state for the *calculated* font size
  const [dynamicFontSize, setDynamicFontSize] = useState(fontSize);
  const textRef = useRef(null);
  const boxRef = useRef(null);

  // Reset to the slider's "Max Size" whenever the scripture changes
  useEffect(() => {
    setDynamicFontSize(fontSize);
  }, [liveScripture, fontSize]);

  // AUTO-SHRINK LOGIC
  useLayoutEffect(() => {
    if (!textRef.current || !boxRef.current) return;

    const checkFit = () => {
      const text = textRef.current;
      const box = boxRef.current;

      // Safety break to prevent infinite loops
      let iterations = 0;
      let currentSize = fontSize; // Start at Max allowed size

      // Loop while text is taller than the box OR text is wider than the box
      // AND we haven't hit the minimum legible size (e.g., 20px)
      while (
        (text.scrollHeight > box.clientHeight || text.scrollWidth > box.clientWidth) &&
        currentSize > 20 &&
        iterations < 100
      ) {
        currentSize -= 2; // Shrink by 2px
        text.style.fontSize = `${currentSize}px`;
        iterations++;
      }
    };

    // Run the check immediately
    // We set the starting size first to reset any previous shrinking
    textRef.current.style.fontSize = `${fontSize}px`;
    checkFit();

  }, [liveScripture, fontSize, layoutMode]); // Re-run when text or mode changes

  // --- LAYOUT DEFINITIONS ---
  const isLowerThird = layoutMode === 'LOWER_THIRD';

  const wrapperStyle = isLowerThird
    ? {
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        height: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 50
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',
        height: '80%',
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
        justifyContent: 'center', // Changed to Center for better auto-fit look
        padding: '0 40px',
        overflow: 'hidden'
      }
    : {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 40px',
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
          ● Projector Ready ({layoutMode}). Waiting for input...
        </div>
      ) : (
        <div style={wrapperStyle} className="animate-in zoom-in-95 fade-in duration-300">

          {/* Header */}
          <div className={`
              bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400 relative z-20
              ${!isLowerThird && "mx-auto"}
          `}>
            {liveScripture.reference}
          </div>

          {/* Body Box */}
          <div
            ref={boxRef} // Reference to the container
            className={`
                bg-slate-900/95 shadow-2xl border border-slate-700 w-full relative z-10
                ${isLowerThird ? "rounded-tr-xl rounded-tl-xl rounded-bl-xl rounded-br-xl" : "rounded-xl"}
                 rounded-xl
            `}
            style={bodyStyle}
          >
            <p
                ref={textRef} // Reference to the text itself
                className="font-serif leading-tight drop-shadow-md transition-opacity duration-100 ease-out text-center"
                style={{
                    // Initial fontSize is set via the effect, but we set color here
                    color: theme.textColor,
                    width: '100%',
                    wordWrap: 'break-word',
                    margin: 0
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