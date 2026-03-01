'use client';

import React, { useRef, useMemo, useState } from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';

interface DraggableItemProps {
  element: CertificateElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDrag: (deltaX: number, deltaY: number) => void;
  onResize: (width: number, height: number) => void;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
}

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null;

/**
 * DraggableItem Component with Resize Handles
 *
 * Memoized component for dragging and resizing elements.
 * Handles:
 * - Left-click drag to move
 * - Corners/edges drag to resize
 * - Selection highlighting
 *
 * Prevents unnecessary re-renders of non-selected elements.
 */
const DraggableItem = React.memo<DraggableItemProps>(
  ({ element, isSelected, onSelect, onDrag, onResize, scale, canvasWidth, canvasHeight }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent, handle?: ResizeHandle) => {
      if (handle) {
        e.preventDefault();
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        onSelect(e);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isSelected) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (isDragging && !resizeHandle) {
        onDrag(deltaX / scale, deltaY / scale);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (resizeHandle) {
        const elementWidthPx = (element.width / 100) * canvasWidth;
        const elementHeightPx = (element.height / 100) * canvasHeight;

        let newWidth = elementWidthPx;
        let newHeight = elementHeightPx;

        // Calculate new dimensions based on handle
        if (resizeHandle.includes('e')) newWidth += deltaX / scale;
        if (resizeHandle.includes('w')) newWidth -= deltaX / scale;
        if (resizeHandle.includes('s')) newHeight += deltaY / scale;
        if (resizeHandle.includes('n')) newHeight -= deltaY / scale;

        onResize(newWidth, newHeight);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeHandle(null);
    };

    const containerStyle: React.CSSProperties = useMemo(
      () => ({
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        opacity: element.visible ? 1 : 0.5,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }),
      [
        element.x,
        element.y,
        element.width,
        element.height,
        element.rotation,
        element.zIndex,
        element.visible,
        isDragging,
      ]
    );

    const borderStyle: React.CSSProperties = isSelected
      ? {
          border: '2px solid #3b82f6',
          boxShadow: 'inset 0 0 0 1px #dbeafe',
          outlineOffset: '-2px',
        }
      : {
          border: '2px solid transparent',
        };

    // Resize handles
    const ResizeHandle: React.FC<{ handle: ResizeHandle; icon: string }> = ({
      handle,
      icon,
    }) => (
      <div
        onMouseDown={(e) => handleMouseDown(e, handle)}
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: '#3b82f6',
          border: '1px solid white',
          borderRadius: '2px',
          cursor: `${handle}-resize`,
        }}
        className={`
          ${handle === 'nw' ? 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 'ne' ? 'top-0 right-0 translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 'se' ? 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' : ''}
          ${handle === 'sw' ? 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' : ''}
          ${handle === 'n' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 'e' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 's' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
          ${handle === 'w' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        `}
      />
    );

    return (
      <div
        ref={elementRef}
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="transition-opacity"
      >
        <div
          style={{
            ...borderStyle,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Element Content */}
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {element.type === 'text' && (
              <div
                style={{
                  fontSize: `${element.fontSize}px`,
                  fontFamily: element.fontFamily,
                  fontWeight: element.fontWeight as any,
                  color: element.color,
                  textAlign: element.textAlign as any,
                  lineHeight: element.lineHeight,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  boxSizing: 'border-box',
                  wordWrap: 'break-word',
                }}
              >
                {element.content}
              </div>
            )}

            {element.type === 'image' && (
              <img
                src={element.src}
                alt={element.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: element.objectFit as any,
                  opacity: element.opacity,
                }}
              />
            )}

            {element.type === 'shape' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.backgroundColor,
                  border: `${element.borderWidth}px solid ${element.borderColor}`,
                  borderRadius: element.shapeType === 'circle' ? '50%' : '0',
                }}
              />
            )}
          </div>

          {/* Resize Handles (only show when selected) */}
          {isSelected && (
            <>
              <ResizeHandle handle="nw" icon="↖" />
              <ResizeHandle handle="ne" icon="↗" />
              <ResizeHandle handle="se" icon="↘" />
              <ResizeHandle handle="sw" icon="↙" />
              <ResizeHandle handle="n" icon="↑" />
              <ResizeHandle handle="e" icon="→" />
              <ResizeHandle handle="s" icon="↓" />
              <ResizeHandle handle="w" icon="←" />
            </>
          )}
        </div>
      </div>
    );
  }
);

DraggableItem.displayName = 'DraggableItem';

export default DraggableItem;
