import React from 'react';
import { useProjection } from '../../context/ProjectionContext';

const OverlayView = () => {
  const { liveScripture, fontSize, theme, layoutMode } = useProjection();

  // --- 1. DEFINE FIXED BOUNDARIES ---
  // We use CSS styles to enforce strict dimensions based on the mode.

  const isLowerThird = layoutMode === 'LOWER_THIRD';

  // Wrapper Style: Positions the entire block (Header + Body) on the screen
  const wrapperStyle = isLowerThird
    ? {
        // LOWER THIRD: Fixed strip at the bottom
        position: 'absolute',
        bottom: '40px',        // Margin from bottom edge
        left: '50%',           // Center horizontally
        transform: 'translateX(-50%)',
        width: '90%',          // 90% of screen width
        height: '280px',       // FIXED HEIGHT (Red Boundary)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end' // Align content to bottom of this fixed box
      }
    : {
        // CENTER SCREEN: Large fixed box in the middle
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '85%',          // Fixed Width
        height: '80%',         // Fixed Height (Red Boundary)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start' // Align content to TOP of this fixed box
      };

  // Body Style: The actual dark box containing the text
  // We make it 'flex-1' (fill remaining space) or fixed depending on need.
  const bodyStyle = isLowerThird
    ? {
        height: '100%',        // Fill the fixed wrapper
        display: 'flex',
        alignItems: 'center',  // Vertically Center text in the strip
        justifyContent: 'flex-start', // Text starts from left
        padding: '0 40px'      // Left/Right Padding
      }
    : {
        height: '100%',        // Fill the fixed wrapper
        display: 'flex',
        alignItems: 'flex-start', // Text starts at TOP
        justifyContent: 'center', // Horizontally Center
        padding: '60px 40px',     // Top Padding (Space from header)
        textAlign: 'center'
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

          {/* Reference Header (The Tab) */}
          {/* We position this relatively so it sits on top of the body */}
          <div className={`
              bg-purple-900 text-white px-6 py-2 inline-block rounded-t-xl font-bold text-2xl shadow-lg border-t border-l border-r border-purple-400 z-10
              ${!isLowerThird && "mx-auto"} // Center the tab in Center Mode
          `}>
            {liveScripture.reference}
          </div>

          {/* Verse Body (The Slate Box) */}
          <div
            className={`
                bg-slate-900/95 rounded-b-xl shadow-2xl border border-slate-700 w-full overflow-hidden
                ${isLowerThird ? "rounded-tr-xl" : "rounded-t-xl"}
            `}
            style={bodyStyle}
          >
            <p
                className="font-serif leading-snug drop-shadow-md transition-all duration-300 ease-out"
                style={{
                    fontSize: `${fontSize}px`,
                    color: theme.textColor,
                    // Ensure text doesn't overflow weirdly
                    width: '100%',
                    wordWrap: 'break-word'
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