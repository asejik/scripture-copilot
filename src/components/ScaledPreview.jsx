import React, { useRef, useState, useLayoutEffect } from 'react';

const ScaledPreview = ({ children, aspectRatio }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    // Standard Projector Width
    const VIRTUAL_WIDTH = 1920;

    // Calculate Height based on Ratio
    // 12:5 = 2.4, 16:9 = 1.777
    const ratio = aspectRatio === '12:5' ? 2.4 : (16/9);
    const VIRTUAL_HEIGHT = VIRTUAL_WIDTH / ratio;

    useLayoutEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                // Measure the parent container (the black box in the dashboard)
                const parent = containerRef.current.parentElement;
                const availableWidth = parent.clientWidth;
                const availableHeight = parent.clientHeight;

                // Calculate scale to fit BOTH width and height (contain)
                const scaleX = availableWidth / VIRTUAL_WIDTH;
                const scaleY = availableHeight / VIRTUAL_HEIGHT;

                // Pick the smaller scale to ensure it fits completely without cropping
                const newScale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave a tiny margin

                setScale(newScale);
            }
        };

        // Initial Calc
        updateScale();

        // Update on Resize of window or parent
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current && containerRef.current.parentElement) {
            observer.observe(containerRef.current.parentElement);
        }

        window.addEventListener('resize', updateScale);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, [aspectRatio]);

    return (
        <div
            className="w-full h-full flex items-center justify-center overflow-hidden bg-black"
        >
            <div
                ref={containerRef}
                style={{
                    width: `${VIRTUAL_WIDTH}px`,
                    height: `${VIRTUAL_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0,
                    // Draw a border so we can see the "virtual screen" limits
                    border: '1px solid #333',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ScaledPreview;