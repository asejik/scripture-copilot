import React, { useState, useEffect } from 'react';

const ResizableVerticalStack = ({ top, bottom, initialSplit = 50 }) => {
  const [split, setSplit] = useState(initialSplit); // Percent height of Top
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const containerHeight = window.innerHeight - 100; // Minus headers
      const deltaPercent = (e.movementY / containerHeight) * 100;

      setSplit(prev => {
        const newSplit = prev + deltaPercent;
        if (newSplit < 20) return 20; // Min 20%
        if (newSplit > 80) return 80; // Max 80%
        return newSplit;
      });
    };

    const handleMouseUp = () => setIsDragging(false);

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
    <div className="flex flex-col h-full w-full overflow-hidden select-none">
      {/* TOP SECTION */}
      {/* Keep overflow-hidden here so the transcript scrolls nicely */}
      <div style={{ height: `${split}%` }} className="min-h-[150px] overflow-hidden relative z-0">
        {top}
      </div>

      {/* HANDLE */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className={`h-1.5 w-full cursor-row-resize hover:bg-blue-500 transition-colors shrink-0 z-10 flex items-center justify-center ${isDragging ? 'bg-blue-600' : 'bg-slate-800'}`}
      >
          {/* Visual Grip Handle */}
          <div className="w-8 h-0.5 bg-slate-600 rounded-full"></div>
      </div>

      {/* BOTTOM SECTION */}
      {/* FIX: Removed 'overflow-hidden' and added 'z-20' so dropdowns appear ON TOP of the section above */}
      <div style={{ height: `${100 - split}%` }} className="min-h-[150px] relative z-20">
        {bottom}
      </div>
    </div>
  );
};

export default ResizableVerticalStack;