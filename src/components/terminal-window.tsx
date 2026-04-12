'use client';

import { X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import App from './terminal-portfolio/src/App';

interface TerminalWindowProps {
  onClose: () => void;
}

export function TerminalWindow({ onClose }: TerminalWindowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 720, height: 480 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragInfo = useRef({
    offsetX: 0,
    offsetY: 0,
  });
  const resizeInfo = useRef({
    startX: 0,
    startY: 0,
    startW: 720,
    startH: 480,
  });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Position the window on the bottom right on initial render
    if (windowRef.current) {
      const { innerWidth, innerHeight } = window;
      const w = Math.min(720, innerWidth - 40);
      const h = Math.min(480, innerHeight - 40);
      setSize({ width: w, height: h });
      setPosition({
        x: innerWidth - w - 20,
        y: innerHeight - h - 20,
      });
    }
  }, []);

  // Clamp position & size on viewport resize
  useEffect(() => {
    const handleResize = () => {
      setSize(currentSize => {
        const maxW = window.innerWidth - 40;
        const maxH = window.innerHeight - 40;
        const newW = Math.min(currentSize.width, maxW);
        const newH = Math.min(currentSize.height, maxH);
        return { width: Math.max(320, newW), height: Math.max(240, newH) };
      });
      setPosition(currentPos => {
        const clampedX = Math.min(Math.max(20, currentPos.x), window.innerWidth - size.width - 20);
        const clampedY = Math.min(Math.max(20, currentPos.y), window.innerHeight - size.height - 20);
        return { x: clampedX, y: clampedY };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size.width, size.height]);
  // Resize logic
  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = e.clientX - resizeInfo.current.startX;
      const dy = e.clientY - resizeInfo.current.startY;
      setSize(() => {
        const rawW = resizeInfo.current.startW + dx;
        const rawH = resizeInfo.current.startH + dy;
        const maxW = window.innerWidth - position.x - 20;
        const maxH = window.innerHeight - position.y - 20;
        return {
          width: Math.min(Math.max(320, rawW), maxW),
          height: Math.min(Math.max(240, rawH), maxH),
        };
      });
    };
    const onResizeUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', onResizeMove);
      document.addEventListener('mouseup', onResizeUp, { once: true });
    }
    return () => {
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    };
  }, [isResizing, position.x, position.y]);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragInfo.current = {
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragInfo.current.offsetX,
        y: e.clientY - dragInfo.current.offsetY,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp, { once: true });
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={windowRef}
      className="fixed bg-zinc-800 rounded-lg shadow-2xl flex flex-col animate-in fade-in-0 zoom-in-95 z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        userSelect: isDragging || isResizing ? 'none' : 'auto',
      }}
    >
      <div
        onMouseDown={onMouseDown}
        className="bg-zinc-700 p-2 flex justify-between items-center rounded-t-lg cursor-grab active:cursor-grabbing"
      >
        <span className="text-sm text-zinc-300 font-mono select-none">/akhil/terminal</span>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="relative flex-grow p-1 bg-black overflow-hidden">
        <div
          className="w-full h-full overflow-y-auto pr-1"
          style={{ pointerEvents: isDragging || isResizing ? 'none' : 'auto' }}
        >
          <App />
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize bg-zinc-600 hover:bg-zinc-500 active:bg-zinc-400 rounded-sm"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.15) inset' }}
          aria-label="Resize terminal"
          role="separator"
        />
      </div>
    </div>
  );
}
