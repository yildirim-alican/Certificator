'use client';

import React, { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CertificateElement } from '@/types/CertificateTemplate';

interface PropertyPanelProps {
  element: CertificateElement | null;
}

/**
 * PropertyPanel Component
 *
 * Edit component properties:
 * - Position (x, y)
 * - Size (width, height)
 * - Rotation
 * - Text properties (font, color, align)
 * - Image properties (opacity, object-fit)
 * - Shape properties (colors, borders)
 */
const PropertyPanel: React.FC<PropertyPanelProps> = ({ element }) => {
  const updateElement = useEditorStore((state) => state.updateElement);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!element) return;
      updateElement(element.id, { [key]: value });
    },
    [element, updateElement]
  );

  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <p className="text-gray-500 text-center mt-8">Select an element to edit</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{element.label}</h3>
      <div className="border-b border-gray-200 mb-4 pb-4">
        <span className="text-xs font-medium text-gray-500 uppercase">{element.type}</span>
      </div>

      {/* Position Section */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-gray-700 mb-3">Position</legend>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">X (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={element.x}
              onChange={(e) => handleChange('x', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Y (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={element.y}
              onChange={(e) => handleChange('y', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* Size Section */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-gray-700 mb-3">Size</legend>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Width (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={element.width}
              onChange={(e) => handleChange('width', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Height (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={element.height}
              onChange={(e) => handleChange('height', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* Rotation Section */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-gray-700 mb-3">Rotation</legend>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Angle: {element.rotation}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={element.rotation}
            onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </fieldset>

      {/* Visibility Section */}
      <fieldset className="mb-6">
        <legend className="text-sm font-semibold text-gray-700 mb-3">Visibility</legend>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={element.visible}
            onChange={(e) => handleChange('visible', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Visible</span>
        </label>
      </fieldset>

      {/* Text Properties */}
      {element.type === 'text' && (
        <>
          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-700 mb-3">Text Content</legend>
            <textarea
              value={element.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter text or variable like {{Name}}"
            />
          </fieldset>

          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-700 mb-3">Typography</legend>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Font Family</label>
                <select
                  value={element.fontFamily || 'Arial'}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Georgia</option>
                  <option>Verdana</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Size (px)</label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={element.fontSize || 16}
                  onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Weight</label>
                <select
                  value={element.fontWeight || 'normal'}
                  onChange={(e) => handleChange('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="700">Extra Bold</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Align</label>
                <select
                  value={element.textAlign || 'left'}
                  onChange={(e) => handleChange('textAlign', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Color</label>
                <input
                  type="color"
                  value={element.color || '#000000'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Line Height</label>
                <input
                  type="number"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={element.lineHeight || 1.5}
                  onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </fieldset>
        </>
      )}

      {/* Image Properties */}
      {element.type === 'image' && (
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold text-gray-700 mb-3">Image</legend>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">URL</label>
              <input
                type="text"
                value={element.src || ''}
                onChange={(e) => handleChange('src', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Object Fit</label>
              <select
                value={element.objectFit || 'contain'}
                onChange={(e) => handleChange('objectFit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>contain</option>
                <option>cover</option>
                <option>fill</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Opacity: {element.opacity || 1}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={element.opacity || 1}
                onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* Shape Properties */}
      {element.type === 'shape' && (
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold text-gray-700 mb-3">Shape</legend>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Type</label>
              <select
                value={element.shapeType || 'rectangle'}
                onChange={(e) => handleChange('shapeType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="line">Line</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Fill Color</label>
              <input
                type="color"
                value={element.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Border Color</label>
              <input
                type="color"
                value={element.borderColor || '#000000'}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Border Width (px)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={element.borderWidth || 1}
                onChange={(e) => handleChange('borderWidth', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default PropertyPanel;
