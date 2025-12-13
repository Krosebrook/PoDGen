
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  side = 'top', 
  className = '',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Update position logic
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const gap = 8; 

      let top = 0;
      let left = 0;

      // Basic positioning
      switch (side) {
        case 'top':
          top = rect.top + scrollY - gap;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + gap;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - gap;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + gap;
          break;
      }
      
      setCoords({ top, left });
    }
  };

  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
      // Add listeners for scroll/resize to keep tooltip attached
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, side]);

  // Transform classes for centering
  const transformClass = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2'
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          ref={tooltipRef}
          style={{ 
            top: coords.top, 
            left: coords.left,
            position: 'absolute'
          }}
          className={`z-[9999] px-2.5 py-1.5 text-xs font-medium text-slate-100 bg-slate-900 border border-slate-700 rounded-md shadow-xl pointer-events-none animate-fadeIn whitespace-nowrap ${transformClass[side]}`}
        >
          {content}
          {/* Simple CSS Arrow */}
          <div className={`absolute w-2 h-2 bg-slate-900 border-slate-700 rotate-45 transform
            ${side === 'top' ? 'border-r border-b bottom-[-5px] left-1/2 -translate-x-1/2' : ''}
            ${side === 'bottom' ? 'border-l border-t top-[-5px] left-1/2 -translate-x-1/2' : ''}
            ${side === 'left' ? 'border-r border-t right-[-5px] top-1/2 -translate-y-1/2' : ''}
            ${side === 'right' ? 'border-l border-b left-[-5px] top-1/2 -translate-y-1/2' : ''}
          `} />
        </div>,
        document.body
      )}
    </>
  );
};
