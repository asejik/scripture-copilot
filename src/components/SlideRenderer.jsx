import React, { useRef, useLayoutEffect } from 'react';
import { useProjection } from '../context/ProjectionContext';

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);
  const boxRef = useRef(null);
  const { headerPosition } = useProjection();

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
  }, [content, fontSize, layoutMode, textAlign, fontFamily, textTransform, aspectRatio, headerPosition]);

  if (!content) return null;

  const isLowerThird = layoutMode === 'LOWER_THIRD';
  const hasSecondary = !!content.secondaryText;

  // Header Position Logic
  const pos = headerPosition || 'TOP_CENTER';
  const isBottom = pos.startsWith('BOTTOM');

  // Align the entire stack (Header + Body) based on position
  let stackAlignItems = 'center'; // Default center
  if (pos.includes('LEFT')) stackAlignItems = 'flex-start';
  if (pos.includes('RIGHT')) stackAlignItems = 'flex-end';

  return (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            // If Lower Third, push everything to bottom. Else Center vertically.
            justifyContent: isLowerThird ? 'flex-end' : 'center',
            paddingBottom: '0'
        }}
    >
        {/* STACK CONTAINER (Holds Header + Text Box tightly together) */}
        <div
            style={{
                display: 'flex',
                // This determines if Header is Above or Below Text
                flexDirection: isBottom ? 'column-reverse' : 'column',
                // This aligns the Header Left/Center/Right relative to the text box
                alignItems: stackAlignItems,
                width: isLowerThird ? '95%' : '100%',
                alignSelf: 'center', // Center the stack horizontally in the screen
                // GAP: This is the "One line" distance. 0.2em is very tight.
                gap: '0.2em',
            }}
        >

            {/* HEADER TAB */}
            <div
                style={{
                    backgroundColor: theme.headerBackgroundColor || '#000000',
                    color: theme.headerTextColor || '#ffffff',
                    fontSize: isPreview ? '0.8em' : '1.5em',
                    padding: isPreview ? '0.2em 0.5em' : '0.2em 1em',
                    fontWeight: 'bold',
                    borderRadius: '0.2em',
                    zIndex: 20,
                    // Prevent header from stretching full width if text is small
                    alignSelf: stackAlignItems,
                }}
            >
                {content.reference}
            </div>

            {/* MAIN TEXT BOX */}
            <div
                ref={boxRef}
                style={{
                    backgroundColor: theme.backgroundColor || '#000000',
                    position: 'relative',
                    zIndex: 10,
                    overflow: 'hidden',
                    width: '100%',
                    // FIX: Changed from fixed height (40%) to AUTO.
                    // This creates the "Shrink Wrap" effect you wanted.
                    height: 'auto',
                    maxHeight: '100%',
                    borderRadius: '0.2em',
                }}
            >
                <div
                    ref={containerRef}
                    style={{
                        color: theme.textColor || '#ffffff',
                        width: '100%',
                        // FIX: Use Percentage padding for perfect scaling
                        padding: aspectRatio === '12:5' ? '2%' : '4%',
                        overflow: 'hidden',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        textTransform: textTransform,
                        fontFamily: fontFamily,
                        display: hasSecondary ? 'grid' : 'flex',
                        flexDirection: 'column',
                        // Align text inside the box
                        justifyContent: 'center',
                        gridTemplateColumns: hasSecondary ? '1fr 1fr' : undefined,
                        gap: hasSecondary ? '5%' : '0',
                        textAlign: textAlign,
                        alignItems: textAlign === 'center' ? 'center' : 'flex-start',
                        lineHeight: '1.1' // Tight line height for compact look
                    }}
                >
                    <div className={`${hasSecondary ? "border-r border-slate-600 pr-5" : "w-full"}`}>
                        {hasSecondary && (
                            <div style={{ fontSize: '0.5em', opacity: 0.7, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.textColor }}>
                                {content.version}
                            </div>
                        )}
                        <p>{content.text}</p>
                    </div>
                    {hasSecondary && (
                        <div className="pl-5">
                            <div style={{ fontSize: '0.5em', opacity: 0.7, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.textColor }}>
                                {content.secondaryVersion}
                            </div>
                            <p style={{ opacity: 0.9 }}>{content.secondaryText}</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
};

export default SlideRenderer;