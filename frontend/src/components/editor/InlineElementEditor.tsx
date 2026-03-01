'use client';

import React from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { useEditorStore } from '@/store/useEditorStore';

interface InlineElementEditorProps {
  element: CertificateElement | null;
}

const InlineElementEditor: React.FC<InlineElementEditorProps> = ({ element }) => {
  const updateElement = useEditorStore((state) => state.updateElement);

  if (!element) {
    return null;
  }

  const isSystemBoundary = element.id.startsWith('system-boundary-');
  if (isSystemBoundary) {
    return (
      <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700 mb-1">System Boundary</p>
        <p className="text-xs text-gray-600">This area is locked by the system.</p>
      </div>
    );
  }

  const handleChange = (key: string, value: unknown) => {
    updateElement(element.id, { [key]: value });
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-white space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Quick Edit</h4>
        <p className="text-xs text-gray-500">{element.label} ({element.type})</p>
      </div>

      {element.type === 'text' && (
        <div>
          <label className="text-xs text-gray-600 block mb-1">Text</label>
          <textarea
            value={element.content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={3}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 block mb-1">X</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={element.x}
            onChange={(e) => handleChange('x', parseFloat(e.target.value))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Y</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={element.y}
            onChange={(e) => handleChange('y', parseFloat(e.target.value))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Width</label>
          <input
            type="number"
            min="1"
            max="100"
            step="0.5"
            value={element.width}
            onChange={(e) => handleChange('width', parseFloat(e.target.value))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Height</label>
          <input
            type="number"
            min="1"
            max="100"
            step="0.5"
            value={element.height}
            onChange={(e) => handleChange('height', parseFloat(e.target.value))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>

      {element.type === 'text' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Font Size</label>
            <input
              type="number"
              min="8"
              max="72"
              value={element.fontSize || 16}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Color</label>
            <input
              type="color"
              value={element.color || '#111827'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineElementEditor;
