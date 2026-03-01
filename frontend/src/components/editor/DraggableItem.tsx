'use client';

import React, { useRef, useMemo, useState } from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { useEditorStore } from '@/store/useEditorStore';

interface DraggableItemProps {
  element: CertificateElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDrag: (deltaX: number, deltaY: number) => void;
  onResize: (width: number, height: number) => void;
  onDragEnd?: () => void;
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
  ({
    element,
    isSelected,
    onSelect,
    onDrag,
    onResize,
    onDragEnd,
    scale,
    canvasWidth,
    canvasHeight,
  }) => {
    const selectionColor = useEditorStore((state) => state.selectionColor);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const isSystemBoundary = element.id.startsWith('system-boundary-');

    const handleMouseDown = (e: React.MouseEvent, handle?: ResizeHandle) => {
      if (isSystemBoundary) {
        return;
      }

      if (handle) {
        e.preventDefault();
        e.stopPropagation();
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        e.stopPropagation();
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
      onDragEnd?.();
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
        cursor: isSystemBoundary ? 'default' : isDragging ? 'grabbing' : 'grab',
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
        isSystemBoundary,
        isDragging,
      ]
    );

    const borderStyle: React.CSSProperties = isSelected
      ? {
          border: `2px solid ${selectionColor}`,
          boxShadow: `inset 0 0 0 1px ${selectionColor}33`,
          outlineOffset: '-2px',
        }
      : {
          border: '2px solid transparent',
        };

    // Resize handles
    const ResizeHandle: React.FC<{ handle: ResizeHandle }> = ({ handle }) => (
      <div
        onMouseDown={(e) => handleMouseDown(e, handle)}
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: selectionColor,
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

    const shadowStyle = element.shadowBlur
      ? `${element.shadowX || 0}px ${element.shadowY || 0}px ${element.shadowBlur || 0}px ${
          element.shadowColor || 'rgba(0,0,0,0.25)'
        }`
      : 'none';

    return (
      <div
        ref={elementRef}
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e);
        }}
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
                  letterSpacing: `${element.letterSpacing || 0}px`,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  boxSizing: 'border-box',
                  wordWrap: 'break-word',
                  opacity: element.opacity ?? 1,
                  textShadow: shadowStyle,
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
                  opacity: element.opacity ?? 1,
                  filter: element.shadowBlur ? `drop-shadow(${shadowStyle})` : undefined,
                }}
              />
            )}

            {element.type === 'shape' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.backgroundColor,
                  border:
                    element.strokePosition === 'outside'
                      ? 'none'
                      : `${element.borderWidth || 0}px solid ${element.borderColor || '#000000'}`,
                  outline:
                    element.strokePosition === 'outside'
                      ? `${element.borderWidth || 0}px solid ${element.borderColor || '#000000'}`
                      : undefined,
                  boxSizing: element.strokePosition === 'inside' ? 'border-box' : 'content-box',
                  borderRadius: element.shapeType === 'circle' ? '50%' : '0',
                  opacity: element.opacity ?? 1,
                  boxShadow: shadowStyle,
                }}
              />
            )}
          </div>

          {/* Resize Handles (only show when selected) */}
          {isSelected && !isSystemBoundary && (
            <>
              <ResizeHandle handle="nw" />
              <ResizeHandle handle="ne" />
              <ResizeHandle handle="se" />
              <ResizeHandle handle="sw" />
              <ResizeHandle handle="n" />
              <ResizeHandle handle="e" />
              <ResizeHandle handle="s" />
              <ResizeHandle handle="w" />
            </>
          )}
        </div>
      </div>
    );
  }
);

DraggableItem.displayName = 'DraggableItem';

export default DraggableItem;
