'use client';

import React, { useMemo } from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';

interface DraggableItemProps {
  element: CertificateElement;
  isSelected: boolean;
  onSelect: () => void;
  scale: number;
}

/**
 * DraggableItem Component
 *
 * Memoized component for rendering individual certificate elements.
 * Prevents unnecessary re-renders of non-selected elements.
 *
 * Props stored as data attributes for easy identification.
 * Position and size calculated from percentage values.
 */
const DraggableItem = React.memo<DraggableItemProps>(
  ({ element, isSelected, onSelect, scale }) => {
    const A4_WIDTH_PX = 1240; // At 150 DPI
    const A4_HEIGHT_PX = 1754;

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
      }),
      [element.x, element.y, element.width, element.height, element.rotation, element.zIndex, element.visible]
    );

    const borderStyle: React.CSSProperties = isSelected
      ? {
          border: '2px solid #2563eb',
          outlineOffset: '-2px',
        }
      : {};

    return (
      <div
        data-element-id={element.id}
        style={{ ...containerStyle, ...borderStyle }}
        onClick={onSelect}
        className="cursor-move hover:outline hover:outline-1 hover:outline-blue-400"
      >
        {element.type === 'text' && (
          <div
            style={{
              fontSize: `${element.fontSize}px`,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.color,
              textAlign: element.textAlign as any,
              lineHeight: element.lineHeight,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
    );
  }
);

DraggableItem.displayName = 'DraggableItem';

export default DraggableItem;
