'use client';

import React, { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Toolbar Component
 *
 * Provides canvas-level controls:
 * - Zoom in/out
 * - Reset zoom
 * - Delete selected element
 */
const Toolbar: React.FC = () => {
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const deleteElement = useEditorStore((state) => state.deleteElement);

  const handleZoomIn = useCallback(() => {
    setScale(Math.min(2, scale * 1.1));
  }, [scale, setScale]);

  const handleZoomOut = useCallback(() => {
    setScale(Math.max(0.5, scale / 1.1));
  }, [scale, setScale]);

  const handleReset = useCallback(() => {
    setScale(1);
  }, [setScale]);

  const handleDelete = useCallback(() => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
    }
  }, [selectedElementId, deleteElement]);

  return (
    <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <span className="text-sm text-gray-600 min-w-max">{Math.round(scale * 100)}%</span>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Reset Zoom"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="border-l border-gray-200 h-6" />

      {selectedElementId && (
        <button
          onClick={handleDelete}
          className="px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
        >
          Delete Element
        </button>
      )}
    </div>
  );
};

export default Toolbar;
