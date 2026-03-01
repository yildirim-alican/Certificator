'use client';

import React from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { useEditorStore } from '@/store/useEditorStore';

interface InlineElementEditorProps {
  element: CertificateElement | null;
}

const InlineElementEditor: React.FC<InlineElementEditorProps> = ({ element }) => {
  const updateElement = useEditorStore((state) => state.updateElement);
  const selectionColor = useEditorStore((state) => state.selectionColor);
  const setSelectionColor = useEditorStore((state) => state.setSelectionColor);

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

  const numberValue = (value: string, fallback = 0) => {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-white space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Quick Edit</h4>
        <p className="text-xs text-gray-500">{element.label} ({element.type})</p>
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-1">Selection Color</label>
        <input
          type="color"
          value={selectionColor}
          onChange={(e) => setSelectionColor(e.target.value)}
          className="w-full h-9 border border-gray-300 rounded"
        />
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
            onChange={(e) => handleChange('x', numberValue(e.target.value, element.x))}
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
            onChange={(e) => handleChange('y', numberValue(e.target.value, element.y))}
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
            onChange={(e) => handleChange('width', numberValue(e.target.value, element.width))}
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
            onChange={(e) => handleChange('height', numberValue(e.target.value, element.height))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Rotation</label>
          <input
            type="number"
            min="-180"
            max="180"
            step="1"
            value={element.rotation}
            onChange={(e) => handleChange('rotation', numberValue(e.target.value, element.rotation))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Opacity</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={element.opacity ?? 1}
            onChange={(e) => handleChange('opacity', numberValue(e.target.value, 1))}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>

      {element.type === 'text' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Font Size</label>
              <input
                type="number"
                min="8"
                max="72"
                value={element.fontSize || 16}
                onChange={(e) => handleChange('fontSize', numberValue(e.target.value, 16))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Text Color</label>
              <input
                type="color"
                value={element.color || '#111827'}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Alignment</label>
              <select
                value={element.textAlign || 'left'}
                onChange={(e) => handleChange('textAlign', e.target.value)}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Weight</label>
              <select
                value={element.fontWeight || 'normal'}
                onChange={(e) => handleChange('fontWeight', e.target.value)}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              >
                <option value="normal">Normal</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Line Height</label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={element.lineHeight || 1.3}
                onChange={(e) => handleChange('lineHeight', numberValue(e.target.value, 1.3))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Letter Spacing</label>
              <input
                type="number"
                min="-2"
                max="20"
                step="0.1"
                value={element.letterSpacing || 0}
                onChange={(e) => handleChange('letterSpacing', numberValue(e.target.value, 0))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
        </>
      )}

      {element.type === 'image' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Layout Fit</label>
            <select
              value={element.objectFit || 'contain'}
              onChange={(e) => handleChange('objectFit', e.target.value)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Flow</label>
            <input
              type="text"
              value="Absolute"
              readOnly
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      )}

      {element.type === 'shape' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Fill Color</label>
              <input
                type="color"
                value={element.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Stroke Color</label>
              <input
                type="color"
                value={element.borderColor || '#000000'}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Stroke Width</label>
              <input
                type="number"
                min="0"
                max="20"
                step="1"
                value={element.borderWidth || 0}
                onChange={(e) => handleChange('borderWidth', numberValue(e.target.value, 0))}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Stroke Position</label>
              <select
                value={element.strokePosition || 'center'}
                onChange={(e) => handleChange('strokePosition', e.target.value)}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
              >
                <option value="inside">Inside</option>
                <option value="center">Center</option>
                <option value="outside">Outside</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Effects</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Shadow Color</label>
            <input
              type="color"
              value={element.shadowColor || '#000000'}
              onChange={(e) => handleChange('shadowColor', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Shadow Blur</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={element.shadowBlur || 0}
              onChange={(e) => handleChange('shadowBlur', numberValue(e.target.value, 0))}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Shadow X</label>
            <input
              type="number"
              min="-100"
              max="100"
              step="1"
              value={element.shadowX || 0}
              onChange={(e) => handleChange('shadowX', numberValue(e.target.value, 0))}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Shadow Y</label>
            <input
              type="number"
              min="-100"
              max="100"
              step="1"
              value={element.shadowY || 0}
              onChange={(e) => handleChange('shadowY', numberValue(e.target.value, 0))}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineElementEditor;
