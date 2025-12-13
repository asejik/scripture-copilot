import React from 'react';
import { useProjection } from '../../context/ProjectionContext';
import SlideRenderer from '../../components/SlideRenderer';

const OverlayView = () => {
  const { liveScripture, fontSize, theme, layoutMode, textAlign, aspectRatio, textTransform, fontFamily } = useProjection();

  // CSS Aspect Ratio to force the container shape
  const ratioValue = aspectRatio === '12:5' ? '2.4 / 1' : '16 / 9';

  return (
    <div className="min-h-screen w-full relative overflow-hidden transition-colors duration-300 flex items-center justify-center bg-black">
      {!liveScripture ? (
        <div className="absolute top-0 left-0 p-4 text-white/50 font-mono text-sm">
          ● Projector Ready ({layoutMode} - {aspectRatio}). Waiting for input...
        </div>
      ) : (
        // ASPECT RATIO CONTAINER
        // This ensures the content is always 16:9 or 12:5 relative to itself,
        // centered in the screen (letterboxed if necessary).
        <div
            style={{
                width: '100%',
                // If the screen is wider than the ratio, height limits it.
                // If the screen is taller, width limits it.
                // We use 'aspect-ratio' CSS property which is robust.
                aspectRatio: ratioValue === '2.4 / 1' ? '2.4/1' : '16/9',
                maxWidth: '100%',
                maxHeight: '100vh',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {/* The Actual Slide Content */}
            <div style={{ width: '100%', height: '100%' }}>
                <SlideRenderer
                    content={liveScripture}
                    theme={theme}
                    fontSize={fontSize}
                    layoutMode={layoutMode}
                    textAlign={textAlign}
                    aspectRatio={aspectRatio}
                    fontFamily={fontFamily}
                    textTransform={textTransform}
                />
            </div>
        </div>
      )}
    </div>
  );
};
export default OverlayView;