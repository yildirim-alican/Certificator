'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import SystemLayoutPicker from '@/components/editor/SystemLayoutPicker';
import InlineElementEditor from '@/components/editor/InlineElementEditor';
import ExportModal from '@/components/editor/ExportModal';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Save, Download, Eye, FileText } from 'lucide-react';
import {
  LayoutOrientation,
  SystemLayoutPreset,
  systemLayoutPresets,
} from '@/components/editor/systemPresets';

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
  const router = useRouter();
  const rawTemplateId = params?.id;
  const templateId = Array.isArray(rawTemplateId)
    ? rawTemplateId[0]
    : rawTemplateId || 'untitled-template';

  const template = useEditorStore((state) => state.template);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const updateTemplateMetadata = useEditorStore((state) => state.updateTemplateMetadata);
  const reorderElements = useEditorStore((state) => state.reorderElements);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const setSelectedElementId = useEditorStore((state) => state.setSelectedElementId);
  const elements = useEditorStore((state) => state.elements);

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activeOrientation, setActiveOrientation] = useState<LayoutOrientation>('landscape');

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // TODO: Load template from API
  useEffect(() => {
    if (!template) {
      // Initialize with empty template
      setTemplate({
        id: templateId,
        name: 'Untitled Template',
        description: '',
        orientation: 'landscape',
        width: 297,
        height: 210,
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

  const handleBulkGenerate = () => {
    if (!template) return;
    router.push('/bulk-generate');
  };

  const handleApplyPreset = (preset: SystemLayoutPreset) => {
    if (!template) return;

    const withBoundary = preset.elements.some((element) => element.id.startsWith('system-boundary-'))
      ? preset.elements
      : [
          {
            id: `system-boundary-${preset.id}`,
            type: 'shape' as const,
            label: 'System Boundary',
            x: 2.5,
            y: 2.5,
            width: 95,
            height: 95,
            rotation: 0,
            zIndex: 0,
            visible: true,
            shapeType: 'rectangle' as const,
            backgroundColor: 'transparent',
            borderColor: '#1f2937',
            borderWidth: 2,
          },
          ...preset.elements,
        ];

    const now = Date.now();
    const withIndexes = withBoundary.map((element, index) => ({
      ...element,
      id: element.id.startsWith('system-boundary-')
        ? `system-boundary-${preset.id}-${now}`
        : `${preset.id}-${index}-${now}`,
      zIndex: index,
    }));

    reorderElements(withIndexes);
    setSelectedElementId(null);
    setActivePresetId(preset.id);
    setActiveOrientation(preset.orientation);
    setTemplate({
      ...template,
      orientation: preset.orientation,
      width: preset.orientation === 'landscape' ? 297 : 210,
      height: preset.orientation === 'landscape' ? 210 : 297,
      elements: withIndexes,
      variables: preset.variables,
      updatedAt: new Date(),
    });
  };

  const handleOrientationChange = (orientation: LayoutOrientation) => {
    if (!template) return;

    setActiveOrientation(orientation);
    setTemplate({
      ...template,
      orientation,
      width: orientation === 'landscape' ? 297 : 210,
      height: orientation === 'landscape' ? 210 : 297,
      updatedAt: new Date(),
    });
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 lg:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
          <div className="flex-1">
            <Input
              value={template.name}
              onChange={(e) => updateTemplateMetadata(e.target.value, template.description)}
              className="text-lg font-semibold"
              placeholder="Template name"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
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
              variant="secondary"
              onClick={handleBulkGenerate}
              className="flex items-center gap-2"
            >
              <FileText size={18} />
              Bulk Generate
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
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {!showPreview && (
          <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-6 overflow-y-auto max-h-screen">
            <SystemLayoutPicker
              presets={systemLayoutPresets}
              activePresetId={activePresetId}
              activeOrientation={activeOrientation}
              onApplyPreset={handleApplyPreset}
              onOrientationChange={handleOrientationChange}
            />
            <InlineElementEditor element={selectedElement} />
          </div>
        )}

        {/* Center: Canvas */}
        <Canvas orientation={template.orientation} backgroundColor={template.backgroundColor} />

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
