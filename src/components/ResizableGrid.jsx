import React, { useState, useEffect } from 'react';

const ResizableGrid = ({ left, middle, right }) => {
  // Initial widths in percentages (33.3% each)
  const [widths, setWidths] = useState({ left: 33.3, middle: 33.3, right: 33.3 });
  const [isDragging, setIsDragging] = useState(null); // 'left' or 'right'

  // Handle Drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const containerWidth = window.innerWidth - 48; // Approx width minus padding
      const deltaPercent = (e.movementX / containerWidth) * 100;

      setWidths(prev => {
        const newWidths = { ...prev };

        if (isDragging === 'left') {
          // Resizing between Left and Middle
          if (prev.left + deltaPercent > 15 && prev.middle - deltaPercent > 15) {
            newWidths.left += deltaPercent;
            newWidths.middle -= deltaPercent;
          }
        } else if (isDragging === 'right') {
          // Resizing between Middle and Right
          if (prev.middle + deltaPercent > 15 && prev.right - deltaPercent > 15) {
            newWidths.middle += deltaPercent;
            newWidths.right -= deltaPercent;
          }
        }
        return newWidths;
      });
    };

    const handleMouseUp = () => setIsDragging(null);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex w-full h-full overflow-hidden select-none gap-1">
      {/* LEFT COLUMN */}
      <div style={{ width: `${widths.left}%` }} className="h-full min-w-[200px]">
        {left}
      </div>

      {/* HANDLE 1 */}
      <div
        onMouseDown={() => setIsDragging('left')}
        className={`w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors ${isDragging === 'left' ? 'bg-blue-600' : 'bg-slate-800'}`}
      />

      {/* MIDDLE COLUMN */}
      <div style={{ width: `${widths.middle}%` }} className="h-full min-w-[200px]">
        {middle}
      </div>

      {/* HANDLE 2 */}
      <div
        onMouseDown={() => setIsDragging('right')}
        className={`w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors ${isDragging === 'right' ? 'bg-blue-600' : 'bg-slate-800'}`}
      />

      {/* RIGHT COLUMN */}
      <div style={{ width: `${widths.right}%` }} className="h-full min-w-[200px]">
        {right}
      </div>
    </div>
  );
};

export default ResizableGrid;