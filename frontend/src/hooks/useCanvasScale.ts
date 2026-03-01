import { useCallback, useState } from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = 1240; // At 150 DPI
const A4_HEIGHT_PX = 1754; // At 150 DPI

export const useCanvasScale = (orientation: 'portrait' | 'landscape' = 'portrait') => {
  const getScaleFactor = useCallback((windowWidth: number): number => {
    const targetWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
    return windowWidth / targetWidth;
  }, [orientation]);

  const percentToPixel = useCallback(
    (percent: number, dimension: 'width' | 'height'): number => {
      const maxPx = dimension === 'width' ? A4_WIDTH_PX : A4_HEIGHT_PX;
      return (percent / 100) * maxPx;
    },
    []
  );

  const pixelToPercent = useCallback(
    (pixel: number, dimension: 'width' | 'height'): number => {
      const maxPx = dimension === 'width' ? A4_WIDTH_PX : A4_HEIGHT_PX;
      return (pixel / maxPx) * 100;
    },
    []
  );

  const getCanvasSize = useCallback(
    (scale: number): { width: number; height: number } => {
      const width = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
      const height = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
      return {
        width: width * scale,
        height: height * scale,
      };
    },
    [orientation]
  );

  return {
    getScaleFactor,
    percentToPixel,
    pixelToPercent,
    getCanvasSize,
    A4_WIDTH_PX,
    A4_HEIGHT_PX,
  };
};

export const useElementDragResize = () => {
  const [currentElement, setCurrentElement] = useState<CertificateElement | null>(null);

  const calculateNewPosition = useCallback(
    (startX: number, startY: number, currentX: number, currentY: number, element: CertificateElement, scale: number) => {
      const deltaX = (currentX - startX) / scale;
      const deltaY = (currentY - startY) / scale;

      return {
        x: Math.max(0, Math.min(100, element.x + deltaX)),
        y: Math.max(0, Math.min(100, element.y + deltaY)),
      };
    },
    []
  );

  return {
    currentElement,
    setCurrentElement,
    calculateNewPosition,
  };
};
