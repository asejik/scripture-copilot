import React, { useRef, useState, useLayoutEffect } from 'react';

const ScaledPreview = ({ children, aspectRatio }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    // Standard Projector Width
    const VIRTUAL_WIDTH = 1920;

    // Calculate Height based on Ratio
    const ratio = aspectRatio === '12:5' ? 2.4 : (16/9);
    const VIRTUAL_HEIGHT = VIRTUAL_WIDTH / ratio;

    useLayoutEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const availableWidth = containerRef.current.offsetWidth;
                const newScale = availableWidth / VIRTUAL_WIDTH;
                setScale(newScale);
            }
        };

        // Initial Calc
        updateScale();

        // Update on Resize
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [aspectRatio]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden bg-black"
        >
            <div
                style={{
                    width: `${VIRTUAL_WIDTH}px`,
                    height: `${VIRTUAL_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0 // Prevent crushing
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ScaledPreview;