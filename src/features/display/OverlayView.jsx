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
          ● Projector Ready ({layoutMode}). Waiting for input...
        </div>
      ) : (
        <div
            className="w-full"
            style={{
                maxWidth: '95%',
                aspectRatio: ratioValue,
            }}
        >
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
      )}
    </div>
  );
};
export default OverlayView;