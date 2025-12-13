import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useProjection } from '../context/ProjectionContext';

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);

  // NEW: Ref for the Header to measure dragging
  const headerRef = useRef(null);

  const { headerPosition, headerFontSize, updateHeaderPosition, backgroundTransparent, headerBackgroundEnabled } = useProjection();

  // DRAG STATE
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Auto-shrink logic (Unchanged)
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
      // Only allow drag in Preview Mode
      if (!isPreview) return;

      e.preventDefault();
      setIsDragging(true);

      // Calculate offset so we don't snap the corner to the mouse
      const rect = headerRef.current.getBoundingClientRect();
      setDragOffset({
          x: e.clientX - rect.left - (rect.width / 2),
          y: e.clientY - rect.top - (rect.height / 2)
      });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        // Get the Parent Container (The Green Box)
        // We need to traverse up to find the root aspect-ratio box
        // A safer way is to assume the parent of the whole component
        const parent = containerRef.current.parentElement.parentElement;
        const parentRect = parent.getBoundingClientRect();

        // Calculate Position relative to Parent (0-100%)
        let x = ((e.clientX - parentRect.left) / parentRect.width) * 100;
        let y = ((e.clientY - parentRect.top) / parentRect.height) * 100;

        // Clamp values to keep inside screen
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        // Update Global State (This syncs preview and output instantly)
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
  const pos = headerPosition || { x: 50, y: 6 }; // Default if null

  // Determine Alignment for styling based on X position
  // If > 70% Right, align right. If < 30% Left, align left. Else Center.
  let stackAlignItems = 'center';
  // We don't use this for the header anymore, only for the text body below.

  const calcHeaderSize = isPreview ? `${headerFontSize * 0.6}px` : `${headerFontSize}px`;

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
                transform: 'translate(-50%, -50%)', // Always center anchor point
                zIndex: 100,
                cursor: isPreview ? (isDragging ? 'grabbing' : 'grab') : 'default',

                // Style
                backgroundColor: headerBackgroundEnabled ? (theme.headerBackgroundColor || '#000000') : 'transparent',
                color: theme.headerTextColor || '#ffffff',
                fontSize: calcHeaderSize,
                padding: isPreview ? '0.1em 0.3em' : '0.15em 0.6em',
                fontWeight: 'bold',
                borderRadius: '0.2em',
                boxShadow: headerBackgroundEnabled ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : 'none',
                whiteSpace: 'nowrap',
                userSelect: 'none' // Prevent text selection while dragging
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