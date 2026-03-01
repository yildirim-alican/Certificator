'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import SystemLayoutPicker from '@/components/editor/SystemLayoutPicker';
import InlineElementEditor from '@/components/editor/InlineElementEditor';
import ExportModal from '@/components/editor/ExportModal';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Save, Download, Eye, FileText, Home } from 'lucide-react';
import { CertificateElement } from '@/types/CertificateTemplate';
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
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const updateTemplateInStore = useTemplateStore((state) => state.updateTemplate);
  const templates = useTemplateStore((state) => state.templates);

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activeOrientation, setActiveOrientation] = useState<LayoutOrientation>('landscape');
  const [issuerLogoSrc, setIssuerLogoSrc] = useState<string>('');
  const [sponsorLogoSrc, setSponsorLogoSrc] = useState<string>('');

  const ALLOWED_VARIABLES = ['[recipient.name]', '[recipient.surname]', '[certificate.success_rate]'];

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
        variables: ['[recipient.name]', '[recipient.surname]'],
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

      if (template) {
        const exists = templates.some((entry) => entry.id === template.id);
        if (exists) {
          updateTemplateInStore(template.id, template);
        } else {
          addTemplate(template);
        }
      }

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

    const defaultLogoWidth = preset.orientation === 'landscape' ? 12 : 20;
    const defaultLogoHeight = preset.orientation === 'landscape' ? 12 : 10;
    const issuerLogoX = preset.orientation === 'landscape' ? 6 : 8;
    const sponsorLogoX = preset.orientation === 'landscape' ? 82 : 72;
    const logoY = preset.orientation === 'landscape' ? 80 : 84;

    const sanitizedPresetElements: CertificateElement[] = preset.elements.map((element) => {
      if (element.type !== 'text') {
        return element;
      }

      return {
        ...element,
        content: (element.content || '')
          .replace(/\[certificate\.issued_on\]/g, '[recipient.surname]')
          .replace(/\[certificate\.uuid\]/g, '[certificate.success_rate]'),
      };
    });

    const withBoundary = sanitizedPresetElements.some((element) =>
      element.id.startsWith('system-boundary-')
    )
      ? sanitizedPresetElements
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
          ...sanitizedPresetElements,
        ];

    const withCoreZones: CertificateElement[] = [...withBoundary];

    if (!withCoreZones.some((element) => element.label.toLowerCase().includes('issuer logo'))) {
      withCoreZones.push({
        id: `${preset.id}-issuer-logo`,
        type: 'image',
        label: 'Issuer Logo',
        x: issuerLogoX,
        y: logoY,
        width: defaultLogoWidth,
        height: defaultLogoHeight,
        rotation: 0,
        zIndex: 10,
        visible: true,
        src: issuerLogoSrc,
        objectFit: 'contain',
        opacity: 1,
      });
    }

    if (!withCoreZones.some((element) => element.label.toLowerCase().includes('sponsor logo'))) {
      withCoreZones.push({
        id: `${preset.id}-sponsor-logo`,
        type: 'image',
        label: 'Sponsor Logo',
        x: sponsorLogoX,
        y: logoY,
        width: defaultLogoWidth,
        height: defaultLogoHeight,
        rotation: 0,
        zIndex: 11,
        visible: true,
        src: sponsorLogoSrc,
        objectFit: 'contain',
        opacity: 1,
      });
    }

    if (
      !withCoreZones.some(
        (element) => element.type === 'text' && (element.content || '').includes('[recipient.surname]')
      )
    ) {
      withCoreZones.push({
        id: `${preset.id}-recipient-surname`,
        type: 'text',
        label: 'Recipient Surname',
        x: preset.orientation === 'landscape' ? 41 : 30,
        y: preset.orientation === 'landscape' ? 90 : 93,
        width: 20,
        height: 4,
        rotation: 0,
        zIndex: 12,
        visible: true,
        content: '[recipient.surname]',
        fontSize: 11,
        fontFamily: 'Arial',
        fontWeight: '600',
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 1.3,
      });
    }

    const now = Date.now();
    const withIndexes: CertificateElement[] = withCoreZones.map((element, index) => {
      const nextId = element.id.startsWith('system-boundary-')
        ? `system-boundary-${preset.id}-${now}`
        : `${preset.id}-${index}-${now}`;

      if (element.type === 'image') {
        const nextSrc = element.label.toLowerCase().includes('issuer logo')
          ? issuerLogoSrc || element.src
          : element.label.toLowerCase().includes('sponsor logo')
            ? sponsorLogoSrc || element.src
            : element.src;

        return {
          ...element,
          id: nextId,
          src: nextSrc,
          zIndex: index,
        };
      }

      return {
        ...element,
        id: nextId,
        zIndex: index,
      };
    });

    const variablesFromElements = Array.from(
      new Set(
        withIndexes
          .filter((element) => element.type === 'text')
          .map((element) => (element.type === 'text' ? element.content || '' : ''))
          .filter((content) => ALLOWED_VARIABLES.includes(content))
      )
    );

    const normalizedVariables = [
      '[recipient.name]',
      '[recipient.surname]',
      ...variablesFromElements.filter(
        (variable) => variable !== '[recipient.name]' && variable !== '[recipient.surname]'
      ),
    ];

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
      variables: normalizedVariables,
      updatedAt: new Date(),
    });
  };

  const readFileAsDataUrl = (file: File, onDone: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onDone(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIssuerLogoUpload = (file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setIssuerLogoSrc(dataUrl);
      elements
        .filter((element) => element.type === 'image' && element.label.toLowerCase().includes('issuer logo'))
        .forEach((element) => {
          useEditorStore.getState().updateElement(element.id, { src: dataUrl });
        });
    });
  };

  const handleSponsorLogoUpload = (file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setSponsorLogoSrc(dataUrl);
      elements
        .filter((element) => element.type === 'image' && element.label.toLowerCase().includes('sponsor logo'))
        .forEach((element) => {
          useEditorStore.getState().updateElement(element.id, { src: dataUrl });
        });
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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="px-4 lg:px-6 py-3 space-y-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <Home size={18} />
                Main Menu
              </Button>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {template.orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {elements.length} Elements
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye size={18} />
                {showPreview ? 'Edit Mode' : 'Preview'}
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
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <Input
              value={template.name}
              onChange={(e) => updateTemplateMetadata(e.target.value, template.description)}
              className="text-base font-semibold"
              placeholder="Template name"
            />
            <Input
              value={template.description || ''}
              onChange={(e) => updateTemplateMetadata(template.name, e.target.value)}
              placeholder="Template description"
            />
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || !template.name.trim()}
              className="flex items-center justify-center gap-2 xl:min-w-[140px]"
            >
              <Save size={18} />
              {isSaving ? 'Creating...' : 'Create'}
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
              onIssuerLogoUpload={handleIssuerLogoUpload}
              onSponsorLogoUpload={handleSponsorLogoUpload}
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
