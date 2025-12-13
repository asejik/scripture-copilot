import React, { useRef, useLayoutEffect } from 'react';
import { useProjection } from '../context/ProjectionContext';

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);

  // Get Position Setting
  const { headerPosition, headerFontSize } = useProjection();

  // Auto-shrink logic
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    el.style.fontSize = `${fontSize}px`;

    let currentSize = fontSize;
    let iterations = 0;

    // We only check if text overflows the container
    while (
      (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
      currentSize > 10 &&
      iterations < 50
    ) {
      currentSize -= 2;
      el.style.fontSize = `${currentSize}px`;
      iterations++;
    }
  }, [content, fontSize, layoutMode, textAlign, fontFamily, textTransform, aspectRatio, headerPosition, headerFontSize]);

  if (!content) return null;

  const hasSecondary = !!content.secondaryText;

  // --- ABSOLUTE POSITIONING LOGIC ---
  // This maps the settings directly to CSS coordinates
  const pos = headerPosition || 'TOP_CENTER';

  const headerStyle = {
      position: 'absolute',
      zIndex: 20,
      padding: isPreview ? '0.2em 0.6em' : '0.4em 1.2em',
      borderRadius: '0.3em',
      backgroundColor: theme.headerBackgroundColor || '#000000',
      color: theme.headerTextColor || '#ffffff',
      fontWeight: 'bold',
      fontSize: isPreview ? `${headerFontSize * 0.6}px` : `${headerFontSize}px`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      whiteSpace: 'nowrap',
      // Default to auto to prevent unwanted stretching
      top: 'auto', bottom: 'auto', left: 'auto', right: 'auto', transform: 'none'
  };

  // Apply coordinates based on the 6 positions
  switch (pos) {
      case 'TOP_LEFT':
          headerStyle.top = '6%';
          headerStyle.left = '6%';
          break;
      case 'TOP_CENTER':
          headerStyle.top = '6%';
          headerStyle.left = '50%';
          headerStyle.transform = 'translateX(-50%)';
          break;
      case 'TOP_RIGHT':
          headerStyle.top = '6%';
          headerStyle.right = '6%';
          break;
      case 'BOTTOM_LEFT':
          headerStyle.bottom = '6%';
          headerStyle.left = '6%';
          break;
      case 'BOTTOM_CENTER':
          headerStyle.bottom = '6%';
          headerStyle.left = '50%';
          headerStyle.transform = 'translateX(-50%)';
          break;
      case 'BOTTOM_RIGHT':
          headerStyle.bottom = '6%';
          headerStyle.right = '6%';
          break;
      default: // Default Top Center
          headerStyle.top = '6%';
          headerStyle.left = '50%';
          headerStyle.transform = 'translateX(-50%)';
  }

  return (
    // MAIN CONTAINER (The "Green Bounding Area")
    <div
        style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            // FIX: Background Color is applied HERE to fill the full aspect ratio
            backgroundColor: theme.backgroundColor || '#000000',
        }}
    >
        {/* 1. HEADER (Absolutely Positioned) */}
        <div style={headerStyle}>
            {content.reference}
        </div>

        {/* 2. TEXT BODY (Centered & Full Size) */}
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center', // Vertically Center
                justifyContent: 'center', // Horizontally Center
                position: 'relative',
                zIndex: 10,
            }}
        >
            <div
                ref={containerRef}
                style={{
                    color: theme.textColor || '#ffffff',
                    // Add padding so text doesn't touch the very edge of the screen
                    width: '90%',
                    maxHeight: '85%', // Leave room for header
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    textTransform: textTransform,
                    fontFamily: fontFamily,
                    display: hasSecondary ? 'grid' : 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gridTemplateColumns: hasSecondary ? '1fr 1fr' : undefined,
                    gap: hasSecondary ? '5%' : '0',
                    textAlign: textAlign,
                    alignItems: textAlign === 'center' ? 'center' : 'flex-start',
                    lineHeight: '1.2'
                }}
            >
                <div className={`${hasSecondary ? "border-r border-slate-600 pr-5" : "w-full"}`}>
                    {hasSecondary && (
                        <div style={{ fontSize: '0.6em', opacity: 0.8, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textColor }}>
                            {content.version}
                        </div>
                    )}
                    <p>{content.text}</p>
                </div>
                {hasSecondary && (
                    <div className="pl-5">
                        <div style={{ fontSize: '0.6em', opacity: 0.8, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textColor }}>
                            {content.secondaryVersion}
                        </div>
                        <p style={{ opacity: 0.9 }}>{content.secondaryText}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SlideRenderer;