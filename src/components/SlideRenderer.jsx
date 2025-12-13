import React, { useRef, useLayoutEffect } from 'react';

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);
  const boxRef = useRef(null);

  // Auto-shrink logic (Same as before, but isolated here)
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // In Preview mode, we might want to skip heavy DOM manipulation or throttle it,
    // but for fidelity, we run the same logic.
    el.style.fontSize = `${fontSize}px`;

    let currentSize = fontSize;
    let iterations = 0;

    // We only shrink if it overflows the container
    while (
      (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
      currentSize > 16 &&
      iterations < 50
    ) {
      currentSize -= 2;
      el.style.fontSize = `${currentSize}px`;
      iterations++;
    }
  }, [content, fontSize, layoutMode, textAlign, fontFamily, textTransform, aspectRatio]);

  if (!content) return null;

  const isLowerThird = layoutMode === 'LOWER_THIRD';
  const hasSecondary = !!content.secondaryText;

  // Aspect Ratio Calculation
  // We use CSS aspect-ratio. For Preview mode, we scale this whole component down using CSS transform in the parent.
  const ratioValue = aspectRatio === '12:5' ? '2.4 / 1' : '16 / 9';

  return (
    <div
        style={{
            width: '100%',
            height: '100%', // Fill parent (which enforces ratio)
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            justifyContent: isLowerThird ? 'flex-end' : 'center', // Key Layout Diff
            paddingBottom: isLowerThird ? '3%' : '0'
        }}
    >
        {/* HEADER TAB */}
        <div
            style={{
                backgroundColor: theme.headerBackgroundColor || '#581c87',
                color: theme.headerTextColor || '#ffffff',
                borderColor: theme.headerBackgroundColor,
                alignSelf: isLowerThird ? 'flex-start' : 'center',
                marginLeft: isLowerThird ? '5%' : 'auto',
                marginRight: isLowerThird ? '0' : 'auto',
                marginBottom: '-1px',
                zIndex: 20,
                fontSize: isPreview ? '1.5em' : '2em', // Slight adjustment for preview readability
                padding: '0.2em 1em',
                borderRadius: '0.5em 0.5em 0 0',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
        >
            {content.reference}
        </div>

        {/* MAIN BOX */}
        <div
            ref={boxRef}
            style={{
                backgroundColor: theme.backgroundColor || '#0f172a',
                borderColor: '#334155',
                borderWidth: '1px',
                position: 'relative',
                zIndex: 10,
                overflow: 'hidden',
                flex: isLowerThird ? '0 0 auto' : '1', // Lower Third has fixed height relative to content usually, but here we fill ratio
                height: isLowerThird ? '35%' : '100%', // Lower Third takes bottom 35%
                width: isLowerThird ? '90%' : '100%',
                alignSelf: 'center',
                borderRadius: isLowerThird ? '1em' : '1em',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
        >
            <div
                ref={containerRef}
                style={{
                    color: theme.textColor || '#ffffff',
                    width: '100%',
                    height: '100%',
                    padding: aspectRatio === '12:5' ? '2em 4em' : '3em 4em',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    textTransform: textTransform,
                    fontFamily: fontFamily,
                    display: hasSecondary ? 'grid' : 'flex',
                    flexDirection: 'column',
                    justifyContent: isLowerThird ? 'center' : 'flex-start',
                    gridTemplateColumns: hasSecondary ? '1fr 1fr' : undefined,
                    gap: hasSecondary ? '2em' : '0',
                    textAlign: textAlign,
                    alignItems: textAlign === 'center' ? 'center' : 'flex-start',
                    lineHeight: '1.4'
                }}
            >
                <div className={`${hasSecondary ? "border-r border-slate-600 pr-5" : "w-full"}`}>
                    {hasSecondary && (
                        <div style={{ fontSize: '0.6em', opacity: 0.7, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d8b4fe' }}>
                            {content.version}
                        </div>
                    )}
                    <p>{content.text}</p>
                </div>
                {hasSecondary && (
                    <div className="pl-5">
                        <div style={{ fontSize: '0.6em', opacity: 0.7, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d8b4fe' }}>
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