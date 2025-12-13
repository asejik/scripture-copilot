import React, { useRef, useLayoutEffect } from 'react';

const SlideRenderer = ({ content, theme, fontSize, layoutMode, textAlign, aspectRatio, fontFamily, textTransform, isPreview = false }) => {
  const containerRef = useRef(null);
  const boxRef = useRef(null);

  // Auto-shrink logic
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // 1. Start with the requested font size
    // If it's a preview, we scale the starting font size down visually to avoid instant-overflow
    // But for accurate calculation relative to container % width, we start with the raw value
    // and let the loop handle it.
    el.style.fontSize = `${fontSize}px`;

    let currentSize = fontSize;
    let iterations = 0;

    // 2. Shrink if overflowing
    // We check if content is bigger than the box
    while (
      (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
      currentSize > 10 && // Allow shrinking down to 10px
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
                // Scale header text based on context
                fontSize: isPreview ? '0.8em' : '2em',
                padding: isPreview ? '0.2em 0.5em' : '0.2em 1em',
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
                // Lower Third height logic
                height: isLowerThird ? '40%' : '100%',
                width: isLowerThird ? '95%' : '100%',
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
                    // FIX: Use Percentage Padding!
                    // This ensures it scales perfectly in the small Preview box AND the big Projector.
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
                    gap: hasSecondary ? '5%' : '0', // Percent gap
                    textAlign: textAlign,
                    alignItems: textAlign === 'center' ? 'center' : 'flex-start',
                    lineHeight: '1.2'
                }}
            >
                <div className={`${hasSecondary ? "border-r border-slate-600 pr-5" : "w-full"}`}>
                    {hasSecondary && (
                        <div style={{ fontSize: '0.5em', opacity: 0.7, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d8b4fe' }}>
                            {content.version}
                        </div>
                    )}
                    <p>{content.text}</p>
                </div>
                {hasSecondary && (
                    <div className="pl-5">
                        <div style={{ fontSize: '0.5em', opacity: 0.7, marginBottom: '0.5em', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d8b4fe' }}>
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