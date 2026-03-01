'use client';

import React, { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { CertificateElement } from '@/types/CertificateTemplate';
import { Plus, Copy, Trash2 } from 'lucide-react';
import Button from '@/components/shared/Button';

interface AddElementFormProps {
  onElementAdded?: () => void;
}

/**
 * AddElementForm Component
 *
 * Panel for adding new elements to the canvas:
 * - Text elements
 * - Images
 * - Variables ({{Name}}, {{Date}})
 * - Shapes
 */
const AddElementForm: React.FC<AddElementFormProps> = ({ onElementAdded }) => {
  const addElement = useEditorStore((state) => state.addElement);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const elements = useEditorStore((state) => state.elements);
  const deleteElement = useEditorStore((state) => state.deleteElement);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const handleAddText = useCallback(() => {
    const newElement: CertificateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      label: 'Text',
      x: 10,
      y: 10,
      width: 30,
      height: 10,
      rotation: 0,
      zIndex: elements.length,
      visible: true,
      content: 'Click to edit',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'center',
      lineHeight: 1.5,
    };
    addElement(newElement);
    onElementAdded?.();
  }, [addElement, elements.length, onElementAdded]);

  const handleAddVariable = useCallback((variable: string) => {
    const newElement: CertificateElement = {
      id: `var-${Date.now()}`,
      type: 'text',
      label: variable,
      x: 10,
      y: 20,
      width: 30,
      height: 10,
      rotation: 0,
      zIndex: elements.length,
      visible: true,
      content: variable,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'center',
      lineHeight: 1.5,
    };
    addElement(newElement);
    onElementAdded?.();
  }, [addElement, elements.length, onElementAdded]);

  const handleAddImage = useCallback(() => {
    const newElement: CertificateElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      label: 'Image',
      x: 10,
      y: 30,
      width: 20,
      height: 20,
      rotation: 0,
      zIndex: elements.length,
      visible: true,
      src: '',
      objectFit: 'contain',
      opacity: 1,
    };
    addElement(newElement);
    onElementAdded?.();
  }, [addElement, elements.length, onElementAdded]);

  const handleAddShape = useCallback((shapeType: 'rectangle' | 'circle') => {
    const newElement: CertificateElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      label: shapeType,
      x: 10,
      y: 40,
      width: 25,
      height: 25,
      rotation: 0,
      zIndex: elements.length,
      visible: true,
      shapeType,
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    };
    addElement(newElement);
    onElementAdded?.();
  }, [addElement, elements.length, onElementAdded]);

  const handleDuplicate = useCallback(() => {
    if (!selectedElement) return;
    const duplicated: CertificateElement = {
      ...selectedElement,
      id: `${selectedElement.id}-copy-${Date.now()}`,
      x: Math.min(100, selectedElement.x + 2),
      y: Math.min(100, selectedElement.y + 2),
    };
    addElement(duplicated);
  }, [selectedElement, addElement]);

  const handleDelete = useCallback(() => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
    }
  }, [selectedElementId, deleteElement]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto max-h-screen">
      {/* Add Element Section */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Element</h3>
      <div className="space-y-3 mb-8">
        <Button variant="primary" onClick={handleAddText} className="w-full flex items-center gap-2">
          <Plus size={18} />
          Add Text
        </Button>
        <Button variant="secondary" onClick={handleAddImage} className="w-full flex items-center gap-2">
          <Plus size={18} />
          Add Image
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAddShape('rectangle')}
          className="w-full flex items-center gap-2"
        >
          <Plus size={18} />
          Rectangle
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAddShape('circle')}
          className="w-full flex items-center gap-2"
        >
          <Plus size={18} />
          Circle
        </Button>
      </div>

      {/* Variables Section */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-gray-700 mb-3">Insert Variable</legend>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">Common variables:</p>
          <div className="grid grid-cols-2 gap-2">
            {['{{Name}}', '{{Title}}', '{{Date}}', '{{Company}}'].map((variable) => (
              <button
                key={variable}
                onClick={() => handleAddVariable(variable)}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium"
              >
                {variable}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {/* Selected Element Actions */}
      {selectedElement && (
        <fieldset className="border-t border-gray-200 pt-6">
          <legend className="text-sm font-semibold text-gray-700 mb-4">Selected Element</legend>
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              ID: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{selectedElement.id}</code>
            </p>
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={handleDuplicate}
                className="w-full flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Duplicate
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default AddElementForm;
