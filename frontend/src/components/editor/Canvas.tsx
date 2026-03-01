'use client';

import React, { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CertificateElement } from '@/types/CertificateTemplate';
import DraggableItem from './DraggableItem';

interface CanvasProps {
  orientation?: 'portrait' | 'landscape';
  backgroundColor?: string;
}

/**
 * Canvas Component
 *
 * Main editing surface for certificate templates.
 * Maintains A4 aspect ratio and handles element selection.
 *
 * Scale Factor Formula:
 * Current Width / A4 Width = Scale
 * Example: 620px / 1240px = 0.5x zoom
 */
const Canvas: React.FC<CanvasProps> = ({
  orientation = 'portrait',
  backgroundColor = '#ffffff',
}) => {
  const elements = useEditorStore((state) => state.elements);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const setSelectedElementId = useEditorStore((state) => state.setSelectedElementId);
  const scale = useEditorStore((state) => state.scale);

  const A4_WIDTH_PX = 1240; // 210mm @ 150 DPI
  const A4_HEIGHT_PX = 1754; // 297mm @ 150 DPI

  const canvasWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;

  const handleElementSelect = useCallback(
    (elementId: string) => {
      setSelectedElementId(elementId);
    },
    [setSelectedElementId]
  );

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4">
      <div
        style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
          backgroundColor,
          position: 'relative',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        {elements.map((element) => (
          <DraggableItem
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={() => handleElementSelect(element.id)}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
