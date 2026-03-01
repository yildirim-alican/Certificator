'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import DraggableItem from './DraggableItem';
import { CertificateElement } from '@/types/CertificateTemplate';

interface CanvasProps {
  orientation?: 'portrait' | 'landscape';
  backgroundColor?: string;
}

interface GuideLine {
  type: 'vertical' | 'horizontal';
  position: number;
}

interface DistanceGuide {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

/**
 * Canvas Component with Drag-Drop Support
 *
 * Enhanced canvas with:
 * - Drag-to-move elements
 * - Drag corners to resize
 * - Selection highlighting
 * - A4 aspect ratio preservation
 *
 * Uses React-RnD internally via DraggableItem component.
 */
const Canvas: React.FC<CanvasProps> = ({
  orientation = 'portrait',
  backgroundColor = '#ffffff',
}) => {
  const elements = useEditorStore((state) => state.elements);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const setSelectedElementId = useEditorStore((state) => state.setSelectedElementId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const scale = useEditorStore((state) => state.scale);
  const showGuides = useEditorStore((state) => state.showGuides);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [activeGuides, setActiveGuides] = useState<GuideLine[]>([]);
  const [distanceGuides, setDistanceGuides] = useState<DistanceGuide[]>([]);
  const [isAltPressed, setIsAltPressed] = useState(false);

  const A4_WIDTH_PX = 1240; // 210mm @ 150 DPI
  const A4_HEIGHT_PX = 1754; // 297mm @ 150 DPI

  const canvasWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
  const renderedScale = Math.min(scale, fitScale);
  const selectedElement = elements.find((element) => element.id === selectedElementId) || null;

  const snapValue = useCallback(
    (value: number, step = 1): number => {
      if (!snapToGrid) return value;
      return Math.round(value / step) * step;
    },
    [snapToGrid]
  );

  useEffect(() => {
    const recalculate = () => {
      if (!viewportRef.current) return;

      const bounds = viewportRef.current.getBoundingClientRect();
      const availableWidth = Math.max(320, bounds.width - 32);
      const availableHeight = Math.max(320, bounds.height - 32);

      const widthScale = availableWidth / canvasWidth;
      const heightScale = availableHeight / canvasHeight;
      const nextFit = Math.min(widthScale, heightScale, 1);
      setFitScale(nextFit);
    };

    recalculate();
    window.addEventListener('resize', recalculate);
    return () => window.removeEventListener('resize', recalculate);
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.altKey) {
        setIsAltPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isAltPressed) {
      setDistanceGuides([]);
    }
  }, [isAltPressed]);

  const getEdgeValues = (element: CertificateElement) => ({
    left: element.x,
    right: element.x + element.width,
    top: element.y,
    bottom: element.y + element.height,
    centerX: element.x + element.width / 2,
    centerY: element.y + element.height / 2,
  });

  const computeDistanceGuides = useCallback(
    (elementId: string, nextX: number, nextY: number) => {
      if (!isAltPressed) {
        setDistanceGuides([]);
        return;
      }

      const current = elements.find((entry) => entry.id === elementId);
      if (!current) {
        setDistanceGuides([]);
        return;
      }

      const moving = {
        ...current,
        x: nextX,
        y: nextY,
      };
      const movingEdge = getEdgeValues(moving);

      const guides: DistanceGuide[] = [
        {
          x1: 0,
          y1: movingEdge.centerY,
          x2: movingEdge.left,
          y2: movingEdge.centerY,
          label: `${Math.round((movingEdge.left / 100) * canvasWidth)}px`,
        },
        {
          x1: movingEdge.right,
          y1: movingEdge.centerY,
          x2: 100,
          y2: movingEdge.centerY,
          label: `${Math.round(((100 - movingEdge.right) / 100) * canvasWidth)}px`,
        },
        {
          x1: movingEdge.centerX,
          y1: 0,
          x2: movingEdge.centerX,
          y2: movingEdge.top,
          label: `${Math.round((movingEdge.top / 100) * canvasHeight)}px`,
        },
        {
          x1: movingEdge.centerX,
          y1: movingEdge.bottom,
          x2: movingEdge.centerX,
          y2: 100,
          label: `${Math.round(((100 - movingEdge.bottom) / 100) * canvasHeight)}px`,
        },
      ];

      let nearestHorizontal: DistanceGuide | null = null;
      let nearestHorizontalGap = Number.POSITIVE_INFINITY;
      let nearestVertical: DistanceGuide | null = null;
      let nearestVerticalGap = Number.POSITIVE_INFINITY;

      elements
        .filter((entry) => entry.id !== elementId)
        .forEach((entry) => {
          const target = getEdgeValues(entry);
          const verticalOverlap =
            Math.max(movingEdge.top, target.top) <= Math.min(movingEdge.bottom, target.bottom);
          const horizontalOverlap =
            Math.max(movingEdge.left, target.left) <= Math.min(movingEdge.right, target.right);

          if (verticalOverlap) {
            if (target.left >= movingEdge.right) {
              const gap = target.left - movingEdge.right;
              if (gap < nearestHorizontalGap) {
                nearestHorizontalGap = gap;
                nearestHorizontal = {
                  x1: movingEdge.right,
                  y1: movingEdge.centerY,
                  x2: target.left,
                  y2: movingEdge.centerY,
                  label: `${Math.round((gap / 100) * canvasWidth)}px`,
                };
              }
            }

            if (target.right <= movingEdge.left) {
              const gap = movingEdge.left - target.right;
              if (gap < nearestHorizontalGap) {
                nearestHorizontalGap = gap;
                nearestHorizontal = {
                  x1: target.right,
                  y1: movingEdge.centerY,
                  x2: movingEdge.left,
                  y2: movingEdge.centerY,
                  label: `${Math.round((gap / 100) * canvasWidth)}px`,
                };
              }
            }
          }

          if (horizontalOverlap) {
            if (target.top >= movingEdge.bottom) {
              const gap = target.top - movingEdge.bottom;
              if (gap < nearestVerticalGap) {
                nearestVerticalGap = gap;
                nearestVertical = {
                  x1: movingEdge.centerX,
                  y1: movingEdge.bottom,
                  x2: movingEdge.centerX,
                  y2: target.top,
                  label: `${Math.round((gap / 100) * canvasHeight)}px`,
                };
              }
            }

            if (target.bottom <= movingEdge.top) {
              const gap = movingEdge.top - target.bottom;
              if (gap < nearestVerticalGap) {
                nearestVerticalGap = gap;
                nearestVertical = {
                  x1: movingEdge.centerX,
                  y1: target.bottom,
                  x2: movingEdge.centerX,
                  y2: movingEdge.top,
                  label: `${Math.round((gap / 100) * canvasHeight)}px`,
                };
              }
            }
          }
        });

      if (nearestHorizontal && nearestHorizontalGap < 40) {
        guides.push(nearestHorizontal);
      }

      if (nearestVertical && nearestVerticalGap < 40) {
        guides.push(nearestVertical);
      }

      setDistanceGuides(guides);
    },
    [elements, canvasWidth, canvasHeight, isAltPressed]
  );

  const handleElementSelect = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedElementId(elementId);
    },
    [setSelectedElementId]
  );

  const handleCanvasClick = useCallback(() => {
    setSelectedElementId(null);
    setActiveGuides([]);
    setDistanceGuides([]);
  }, [setSelectedElementId]);

  const handleElementDrag = useCallback(
    (elementId: string, deltaX: number, deltaY: number) => {
      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      // Convert pixel delta to percentage
      const percentDeltaX = (deltaX / canvasWidth) * 100;
      const percentDeltaY = (deltaY / canvasHeight) * 100;

      let newX = Math.max(0, Math.min(100, element.x + percentDeltaX));
      let newY = Math.max(0, Math.min(100, element.y + percentDeltaY));

      const guides: GuideLine[] = [];
      const edgeThreshold = 0.7;
      const alignThreshold = 0.9;

      const moving = {
        left: newX,
        right: newX + element.width,
        top: newY,
        bottom: newY + element.height,
        centerX: newX + element.width / 2,
        centerY: newY + element.height / 2,
      };

      const xCandidates: Array<{ move: 'left' | 'centerX' | 'right'; target: number }> = [
        { move: 'left', target: 0 },
        { move: 'centerX', target: 50 },
        { move: 'right', target: 100 },
      ];

      const yCandidates: Array<{ move: 'top' | 'centerY' | 'bottom'; target: number }> = [
        { move: 'top', target: 0 },
        { move: 'centerY', target: 50 },
        { move: 'bottom', target: 100 },
      ];

      elements
        .filter((entry) => entry.id !== elementId)
        .forEach((entry) => {
          const target = getEdgeValues(entry);
          xCandidates.push(
            { move: 'left', target: target.left },
            { move: 'centerX', target: target.centerX },
            { move: 'right', target: target.right }
          );
          yCandidates.push(
            { move: 'top', target: target.top },
            { move: 'centerY', target: target.centerY },
            { move: 'bottom', target: target.bottom }
          );
        });

      const bestX = xCandidates
        .map((candidate) => {
          const current = moving[candidate.move];
          return {
            candidate,
            diff: candidate.target - current,
            absDiff: Math.abs(candidate.target - current),
          };
        })
        .sort((a, b) => a.absDiff - b.absDiff)[0];

      const bestY = yCandidates
        .map((candidate) => {
          const current = moving[candidate.move];
          return {
            candidate,
            diff: candidate.target - current,
            absDiff: Math.abs(candidate.target - current),
          };
        })
        .sort((a, b) => a.absDiff - b.absDiff)[0];

      if (bestX && bestX.absDiff <= alignThreshold) {
        newX += bestX.diff;
        guides.push({ type: 'vertical', position: bestX.candidate.target });
      } else if (Math.abs(moving.centerX - 50) <= edgeThreshold) {
        guides.push({ type: 'vertical', position: 50 });
      }

      if (bestY && bestY.absDiff <= alignThreshold) {
        newY += bestY.diff;
        guides.push({ type: 'horizontal', position: bestY.candidate.target });
      } else if (Math.abs(moving.centerY - 50) <= edgeThreshold) {
        guides.push({ type: 'horizontal', position: 50 });
      }

      if (snapToGrid) {
        newX = snapValue(newX, 1);
        newY = snapValue(newY, 1);

        const centerX = newX + element.width / 2;
        const centerY = newY + element.height / 2;
        if (Math.abs(centerX - 50) <= 1) {
          newX = 50 - element.width / 2;
        }
        if (Math.abs(centerY - 50) <= 1) {
          newY = 50 - element.height / 2;
        }
      }

      newX = Math.max(0, Math.min(100 - element.width, newX));
      newY = Math.max(0, Math.min(100 - element.height, newY));

      setActiveGuides(showGuides ? guides : []);
      computeDistanceGuides(elementId, newX, newY);

      updateElement(elementId, { x: newX, y: newY });
    },
    [
      elements,
      canvasWidth,
      canvasHeight,
      updateElement,
      snapToGrid,
      snapValue,
      showGuides,
      computeDistanceGuides,
    ]
  );

  const handleDragEnd = useCallback(() => {
    setActiveGuides([]);
    if (!isAltPressed) {
      setDistanceGuides([]);
    }
  }, [isAltPressed]);

  const handleElementResize = useCallback(
    (elementId: string, newWidth: number, newHeight: number) => {
      // Convert pixel dimensions to percentage
      const percentWidth = (newWidth / canvasWidth) * 100;
      const percentHeight = (newHeight / canvasHeight) * 100;

      const nextWidth = snapToGrid ? snapValue(percentWidth, 1) : percentWidth;
      const nextHeight = snapToGrid ? snapValue(percentHeight, 1) : percentHeight;

      updateElement(elementId, {
        width: Math.max(5, Math.min(100, nextWidth)),
        height: Math.max(5, Math.min(100, nextHeight)),
      });
    },
    [canvasWidth, canvasHeight, updateElement, snapToGrid, snapValue]
  );

  const selectedCenterX = selectedElement ? selectedElement.x + selectedElement.width / 2 : null;
  const selectedCenterY = selectedElement ? selectedElement.y + selectedElement.height / 2 : null;
  const fallbackGuides: GuideLine[] = [];
  if (showGuides && selectedCenterX !== null && Math.abs(selectedCenterX - 50) <= 1.2) {
    fallbackGuides.push({ type: 'vertical', position: 50 });
  }
  if (showGuides && selectedCenterY !== null && Math.abs(selectedCenterY - 50) <= 1.2) {
    fallbackGuides.push({ type: 'horizontal', position: 50 });
  }
  const guidesToRender = activeGuides.length > 0 ? activeGuides : fallbackGuides;

  return (
    <div ref={viewportRef} className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-hidden min-h-[55vh] lg:min-h-0">
      <div
        style={{
          width: `${canvasWidth * renderedScale}px`,
          height: `${canvasHeight * renderedScale}px`,
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          backgroundColor,
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
        onClick={handleCanvasClick}
      >
        {/* Guide Grid (optional) */}
        {showGuides && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(200, 200, 200, 0.07) 25%, rgba(200, 200, 200, 0.07) 26%, transparent 27%, transparent 74%, rgba(200, 200, 200, 0.07) 75%, rgba(200, 200, 200, 0.07) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(200, 200, 200, 0.07) 25%, rgba(200, 200, 200, 0.07) 26%, transparent 27%, transparent 74%, rgba(200, 200, 200, 0.07) 75%, rgba(200, 200, 200, 0.07) 76%, transparent 77%, transparent)
              `,
              backgroundSize: `${50 * renderedScale}px ${50 * renderedScale}px`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {guidesToRender.map((guide, index) =>
          guide.type === 'vertical' ? (
            <div
              key={`guide-v-${index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: `${guide.position}%`,
                transform: 'translateX(-50%)',
                width: '1px',
                height: '100%',
                backgroundColor: '#3b82f6',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />
          ) : (
            <div
              key={`guide-h-${index}`}
              style={{
                position: 'absolute',
                left: 0,
                top: `${guide.position}%`,
                transform: 'translateY(-50%)',
                width: '100%',
                height: '1px',
                backgroundColor: '#3b82f6',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />
          )
        )}

        {distanceGuides.map((guide, index) => {
          const isHorizontal = Math.abs(guide.y1 - guide.y2) < 0.01;
          const left = Math.min(guide.x1, guide.x2);
          const top = Math.min(guide.y1, guide.y2);
          const width = Math.abs(guide.x2 - guide.x1);
          const height = Math.abs(guide.y2 - guide.y1);

          return (
            <React.Fragment key={`distance-${index}`}>
              <div
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: `${top}%`,
                  width: isHorizontal
                    ? `${Math.max(width, 0.1)}%`
                    : `${Math.max(1 / renderedScale, 1)}px`,
                  height: isHorizontal
                    ? `${Math.max(1 / renderedScale, 1)}px`
                    : `${Math.max(height, 0.1)}%`,
                  backgroundColor: '#10b981',
                  zIndex: 4,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${isHorizontal ? left + width / 2 : guide.x1 + 0.8}%`,
                  top: `${isHorizontal ? guide.y1 + 0.8 : top + height / 2}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(10, 11 * renderedScale)}px`,
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '4px',
                  padding: '1px 4px',
                  zIndex: 5,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {guide.label}
              </div>
            </React.Fragment>
          );
        })}

        {/* Elements Layer */}
        <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
          {elements.map((element) => (
            <DraggableItem
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={(e) => handleElementSelect(element.id, e)}
              onDrag={(dx, dy) => handleElementDrag(element.id, dx, dy)}
              onResize={(w, h) => handleElementResize(element.id, w, h)}
              onDragEnd={handleDragEnd}
              scale={renderedScale}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
