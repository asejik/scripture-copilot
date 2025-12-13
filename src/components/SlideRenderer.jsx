import React, { useRef, useLayoutEffect } from 'react';
import { useProjection } from '../context/ProjectionContext'; // Need context to get headerPosition

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);
  const boxRef = useRef(null);

  // Need to grab headerPosition from Context manually since it's not passed as prop in old instances
  // Or simpler: Update AudioMonitor to pass it.
  // Best approach: Use the hook inside here if not passed.
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

  // --- HEADER POSITIONING LOGIC ---
  // Default to TOP_CENTER if undefined
  const pos = headerPosition || 'TOP_CENTER';
  const isBottom = pos.startsWith('BOTTOM');

  // Alignment: Left, Center, or Right
  let align = 'center';
  if (pos.includes('LEFT')) align = 'flex-start';
  if (pos.includes('RIGHT')) align = 'flex-end';

  // Margins to create "Spacing" between header and body
  // If Top: header needs margin-bottom. If Bottom: header needs margin-top.
  const headerMargin = isBottom ? '10px 0 0 0' : '0 0 10px 0';

  return (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            justifyContent: isLowerThird ? 'flex-end' : 'center',
            paddingBottom: '0'
        }}
    >
        {/* CONTAINER FOR HEADER AND BODY */}
        <div
            style={{
                display: 'flex',
                // COLUMN-REVERSE puts the first item (Header) at the bottom!
                flexDirection: isBottom ? 'column-reverse' : 'column',
                alignItems: align, // Controls Horizontal Alignment
                width: isLowerThird ? '95%' : '100%',
                height: isLowerThird ? 'auto' : '100%', // Lower Third wraps content, Center fills
                maxHeight: '100%',
                alignSelf: 'center', // Center this stack horizontally in the outer container
            }}
        >

            {/* HEADER TAB */}
            <div
                style={{
                    backgroundColor: theme.headerBackgroundColor || '#000000',
                    color: theme.headerTextColor || '#ffffff',
                    zIndex: 20,
                    fontSize: isPreview ? '0.8em' : '1.5em',
                    padding: isPreview ? '0.2em 0.5em' : '0.4em 1em',
                    fontWeight: 'bold',
                    margin: headerMargin, // Dynamic margin based on position
                    // Slight visual tweak: remove rounding if it floats freely, or keep it
                    borderRadius: '0.2em',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    flexShrink: 0 // Don't let header shrink
                }}
            >
                {content.reference}
            </div>

            {/* MAIN BOX */}
            <div
                ref={boxRef}
                style={{
                    backgroundColor: theme.backgroundColor || '#000000',
                    position: 'relative',
                    zIndex: 10,
                    overflow: 'hidden',
                    width: '100%', // Fill width of the stack
                    // Lower third gets fixed height logic, Center gets flexible
                    height: isLowerThird ? '280px' : '100%',
                    borderRadius: '0.2em',
                }}
            >
                <div
                    ref={containerRef}
                    style={{
                        color: theme.textColor || '#ffffff',
                        width: '100%',
                        height: '100%',
                        padding: aspectRatio === '12:5' ? '4%' : '6%',
                        overflow: 'hidden',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        textTransform: textTransform,
                        fontFamily: fontFamily,
                        display: hasSecondary ? 'grid' : 'flex',
                        flexDirection: 'column',
                        justifyContent: isLowerThird ? 'center' : 'center',
                        gridTemplateColumns: hasSecondary ? '1fr 1fr' : undefined,
                        gap: hasSecondary ? '5%' : '0',
                        textAlign: textAlign,
                        alignItems: textAlign === 'center' ? 'center' : 'flex-start',
                        lineHeight: '1.2'
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