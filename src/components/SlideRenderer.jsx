import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useProjection } from '../context/ProjectionContext';

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  const { headerPosition, headerFontSize, updateHeaderPosition, backgroundTransparent, headerBackgroundEnabled } = useProjection();

  // DRAG STATE
  const [isDragging, setIsDragging] = useState(false);

  // Auto-shrink logic
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.style.fontSize = `${fontSize}px`;
    let currentSize = fontSize;
    let iterations = 0;
    while (
      (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
      currentSize > 10 &&
      iterations < 50
    ) {
      currentSize -= 2;
      el.style.fontSize = `${currentSize}px`;
      iterations++;
    }
  }, [content, fontSize, layoutMode, textAlign, fontFamily, textTransform, aspectRatio, headerPosition, headerFontSize, backgroundTransparent, headerBackgroundEnabled]);

  // DRAG HANDLERS
  const handleMouseDown = (e) => {
      // FIX: Only allow drag if isPreview is TRUE
      if (!isPreview) return;

      e.preventDefault();
      setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        // Get the Parent Container (The Green Box)
        // We traverse up to find the container that holds the background color
        const parent = containerRef.current.parentElement.parentElement;
        const parentRect = parent.getBoundingClientRect();

        // Calculate Position relative to Parent (0-100%)
        // This math works even if the preview is Scaled/Zoomed out!
        let x = ((e.clientX - parentRect.left) / parentRect.width) * 100;
        let y = ((e.clientY - parentRect.top) / parentRect.height) * 100;

        // Clamp values 0-100
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        updateHeaderPosition({ x, y });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateHeaderPosition]);


  if (!content) return null;

  const isLowerThird = layoutMode === 'LOWER_THIRD';
  const hasSecondary = !!content.secondaryText;

  // Use Coordinates
  const pos = headerPosition || { x: 50, y: 6 };

  // FIX: Always render full size font.
  // ScaledPreview component handles the visual shrinking for the dashboard.
  const calcHeaderSize = `${headerFontSize}px`;

  return (
    // MAIN CONTAINER
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            justifyContent: isLowerThird ? 'flex-end' : 'center',
            backgroundColor: backgroundTransparent ? 'transparent' : (theme.backgroundColor || '#000000'),
            overflow: 'hidden'
        }}
    >
        {/* 1. HEADER (ABSOLUTE DRAGGABLE) */}
        <div
            ref={headerRef}
            onMouseDown={handleMouseDown}
            style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
                // Cursor changes to indicate draggable state
                cursor: isPreview ? (isDragging ? 'grabbing' : 'grab') : 'none',

                // Style
                backgroundColor: headerBackgroundEnabled ? (theme.headerBackgroundColor || '#000000') : 'transparent',
                color: theme.headerTextColor || '#ffffff',
                fontSize: calcHeaderSize,
                // FIX: Use standard padding. ScaledPreview will shrink it visually.
                padding: '0.15em 0.6em',
                fontWeight: 'bold',
                borderRadius: '0.2em',
                boxShadow: headerBackgroundEnabled ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : 'none',
                whiteSpace: 'nowrap',
                userSelect: 'none'
            }}
        >
            {content.reference}
        </div>

        {/* 2. TEXT BODY */}
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10,
            }}
        >
            <div
                ref={containerRef}
                style={{
                    color: theme.textColor || '#ffffff',
                    width: '90%',
                    maxHeight: '85%',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
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