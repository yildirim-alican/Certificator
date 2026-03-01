'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useParams } from 'next/navigation';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import PropertyPanel from '@/components/editor/PropertyPanel';
import AddElementForm from '@/components/editor/AddElementForm';
import ExportModal from '@/components/editor/ExportModal';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Save, Download, Eye } from 'lucide-react';

/**
 * Editor Page
 *
 * Full certificate template editor with:
 * - Side panel for adding elements
 * - Canvas for editing
 * - Property panel for customization
 * - Toolbar for zoom and export
 *
 * URL: /editor/[template-id]
 */
export default function EditorPage() {
  const params = useParams();
  const templateId = params.id as string;

  const template = useEditorStore((state) => state.template);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const updateTemplateMetadata = useEditorStore((state) => state.updateTemplateMetadata);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const elements = useEditorStore((state) => state.elements);

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // TODO: Load template from API
  useEffect(() => {
    if (!template) {
      // Initialize with empty template
      setTemplate({
        id: templateId,
        name: 'Untitled Template',
        description: '',
        orientation: 'portrait',
        width: 210,
        height: 297,
        backgroundColor: '#ffffff',
        elements: [],
        variables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [templateId, template, setTemplate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to save template
      console.log('Saving template:', {
        id: template?.id,
        name: template?.name,
        elements,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setShowExportModal(true);
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={template.name}
              onChange={(e) => updateTemplateMetadata(e.target.value, template.description)}
              className="text-lg font-semibold"
              placeholder="Template name"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye size={18} />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export PDF
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Add Elements */}
        {!showPreview && <AddElementForm />}

        {/* Center: Canvas */}
        <Canvas orientation={template.orientation} backgroundColor={template.backgroundColor} />

        {/* Right Panel: Properties */}
        {!showPreview && <PropertyPanel element={selectedElement} />}
      </div>

      {/* Toolbar */}
      {!showPreview && <Toolbar />}

      {/* Export Modal */}
      <ExportModal
        template={template}
        data={{}}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
