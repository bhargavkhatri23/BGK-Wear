import React, { useState, useRef, useEffect } from 'react';

interface PinchZoomViewerProps {
  src: string;
  alt: string;
}

export const PinchZoomViewer: React.FC<PinchZoomViewerProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{
    dist: number;
    scale: number;
    x: number;
    y: number;
    touch1: { x: number; y: number };
  } | null>(null);

  const singleTouchStartRef = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);

  const lastTapRef = useRef<number>(0);

  // Reset scale and position if image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setIsInteracting(true);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRef.current = {
        dist,
        scale,
        x: position.x,
        y: position.y,
        touch1: { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
      };
      singleTouchStartRef.current = null;
    } else if (e.touches.length === 1) {
      // Handle double tap to toggle zoom
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(2.5);
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        setIsInteracting(true);
        singleTouchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          posX: position.x,
          posY: position.y
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = dist / touchStartRef.current.dist;
      const newScale = Math.min(Math.max(touchStartRef.current.scale * factor, 1), 4);
      
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && singleTouchStartRef.current && scale > 1) {
      const dx = e.touches[0].clientX - singleTouchStartRef.current.x;
      const dy = e.touches[0].clientY - singleTouchStartRef.current.y;
      
      setPosition({
        x: singleTouchStartRef.current.posX + dx,
        y: singleTouchStartRef.current.posY + dy
      });
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
    touchStartRef.current = null;
    singleTouchStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(scale + delta, 1), 4);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale > 1) {
      setIsInteracting(true);
      singleTouchStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (singleTouchStartRef.current && scale > 1) {
      const dx = e.clientX - singleTouchStartRef.current.x;
      const dy = e.clientY - singleTouchStartRef.current.y;
      setPosition({
        x: singleTouchStartRef.current.posX + dx,
        y: singleTouchStartRef.current.posY + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsInteracting(false);
    singleTouchStartRef.current = null;
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full h-full flex items-center justify-center touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={src}
        alt={alt}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isInteracting ? 'none' : 'transform 0.15s ease-out'
        }}
        className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing"
        draggable={false}
      />

      {scale > 1 && (
        <button
          onClick={resetZoom}
          type="button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold z-20 shadow-lg transition-all border border-white/20"
        >
          Reset Zoom ({Math.round(scale * 100)}%)
        </button>
      )}
    </div>
  );
};
