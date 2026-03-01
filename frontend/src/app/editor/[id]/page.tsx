'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import PropertyPanel from '@/components/editor/PropertyPanel';
import SystemLayoutPicker, { SystemLayoutPreset } from '@/components/editor/SystemLayoutPicker';
import ExportModal from '@/components/editor/ExportModal';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Save, Download, Eye, FileText } from 'lucide-react';
import { CertificateElement } from '@/types/CertificateTemplate';

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
  const templateId = params.id as string;

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

  const createTextElement = (
    id: string,
    label: string,
    content: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number,
    fontWeight: 'normal' | 'bold' | '500' | '600' | '700' = 'normal'
  ): CertificateElement => ({
    id,
    type: 'text',
    label,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex: 1,
    visible: true,
    content,
    fontSize,
    fontFamily: 'Arial',
    fontWeight,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 1.3,
  });

  const systemPresets: SystemLayoutPreset[] = [
    {
      id: 'classic-award',
      name: 'Classic Award',
      description: 'Centered title with recipient name and date.',
      variables: ['{{Name}}', '{{Title}}', '{{Date}}'],
      elements: [
        {
          id: 'classic-border',
          type: 'shape',
          label: 'Border',
          x: 3,
          y: 3,
          width: 94,
          height: 94,
          rotation: 0,
          zIndex: 0,
          visible: true,
          shapeType: 'rectangle',
          backgroundColor: '#ffffff',
          borderColor: '#1f2937',
          borderWidth: 2,
        },
        createTextElement('classic-title', 'Title', 'Certificate of Achievement', 15, 14, 70, 10, 34, 'bold'),
        createTextElement('classic-subtitle', 'Subtitle', 'This certificate is proudly presented to', 20, 29, 60, 6, 16),
        createTextElement('classic-name', 'Recipient', '{{Name}}', 18, 38, 64, 10, 40, 'bold'),
        createTextElement('classic-desc', 'Description', 'For outstanding performance as {{Title}}', 18, 50, 64, 7, 18),
        createTextElement('classic-date', 'Date', 'Date: {{Date}}', 38, 74, 24, 5, 14),
      ],
    },
    {
      id: 'modern-minimal',
      name: 'Modern Minimal',
      description: 'Clean left-aligned modern design.',
      variables: ['{{Name}}', '{{Company}}', '{{Date}}'],
      elements: [
        {
          id: 'modern-accent',
          type: 'shape',
          label: 'Accent Bar',
          x: 6,
          y: 10,
          width: 2,
          height: 78,
          rotation: 0,
          zIndex: 0,
          visible: true,
          shapeType: 'rectangle',
          backgroundColor: '#2563eb',
          borderColor: '#2563eb',
          borderWidth: 0,
        },
        createTextElement('modern-title', 'Title', 'CERTIFICATE', 12, 16, 60, 8, 34, 'bold'),
        createTextElement('modern-subtitle', 'Subtitle', 'Presented to', 12, 29, 30, 5, 16),
        createTextElement('modern-name', 'Recipient', '{{Name}}', 12, 36, 70, 9, 38, 'bold'),
        createTextElement('modern-company', 'Company', '{{Company}}', 12, 49, 50, 6, 20),
        createTextElement('modern-date', 'Date', '{{Date}}', 12, 77, 24, 5, 14),
      ],
    },
    {
      id: 'completion-pro',
      name: 'Completion Pro',
      description: 'Training/course completion style layout.',
      variables: ['{{Name}}', '{{Title}}', '{{Date}}', '{{Company}}'],
      elements: [
        createTextElement('completion-title', 'Title', 'Certificate of Completion', 14, 14, 72, 9, 32, 'bold'),
        createTextElement('completion-subtitle', 'Subtitle', 'This certifies that', 30, 28, 40, 5, 16),
        createTextElement('completion-name', 'Name', '{{Name}}', 18, 36, 64, 9, 38, 'bold'),
        createTextElement('completion-body', 'Body', 'has successfully completed {{Title}} at {{Company}}', 14, 48, 72, 8, 18),
        createTextElement('completion-date-label', 'Date Label', 'Issued on', 38, 71, 24, 4, 13),
        createTextElement('completion-date', 'Date', '{{Date}}', 35, 75, 30, 5, 16, 'bold'),
      ],
    },
  ];

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

  const handleBulkGenerate = () => {
    if (!template) return;
    router.push('/bulk-generate');
  };

  const handleApplyPreset = (preset: SystemLayoutPreset) => {
    if (!template) return;

    const withIndexes = preset.elements.map((element, index) => ({
      ...element,
      id: `${preset.id}-${index}-${Date.now()}`,
      zIndex: index,
    }));

    reorderElements(withIndexes);
    setSelectedElementId(null);
    setActivePresetId(preset.id);
    setTemplate({
      ...template,
      elements: withIndexes,
      variables: preset.variables,
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: System Layout Picker */}
        {!showPreview && (
          <SystemLayoutPicker
            presets={systemPresets}
            activePresetId={activePresetId}
            onApplyPreset={handleApplyPreset}
          />
        )}

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
