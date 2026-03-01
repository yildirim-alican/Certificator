'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import BulkGenerationWorkflow from '@/components/excel/BulkGenerationWorkflow';
import Button from '@/components/shared/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Bulk Generation Page
 *
 * Allows users to:
 * 1. Upload Excel file with certificate data
 * 2. Map columns to template variables
 * 3. Preview and validate data
 * 4. Generate bulk certificates
 *
 * URL: /bulk-generate/[template-id]
 */
export default function BulkGeneratePage() {
  const router = useRouter();
  const editorTemplate = useEditorStore((state) => state.template);
  const savedTemplates = useTemplateStore((state) => state.templates);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    editorTemplate?.id || savedTemplates[0]?.id || ''
  );

  const templateOptions = useMemo(() => {
    const options = [...savedTemplates];
    if (editorTemplate && !options.some((entry) => entry.id === editorTemplate.id)) {
      options.unshift(editorTemplate);
    }
    return options;
  }, [savedTemplates, editorTemplate]);

  const selectedTemplate = templateOptions.find((template) => template.id === selectedTemplateId);

  if (!selectedTemplate && templateOptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="text-amber-600 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Template Selected</h2>
          <p className="text-gray-600 mb-6">
            Please select or create a template before generating bulk certificates.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go to Templates
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerationStart = async (
    data: Record<string, string>[]
  ): Promise<void> => {
    setGenerationError(null);

    try {
      // Prepare payload
      const payload = {
        template: {
          name: selectedTemplate?.name,
          orientation: selectedTemplate?.orientation,
          width: selectedTemplate?.width,
          height: selectedTemplate?.height,
          backgroundColor: selectedTemplate?.backgroundColor,
          elements: selectedTemplate?.elements,
        },
        data,
        fileName: (selectedTemplate?.name || 'certificates').replace(/\s+/g, '-').toLowerCase(),
      };

      // Call backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/excel/generate-bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      // Download ZIP file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${payload.fileName}_batch.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(message);
      throw error;
    }
  };

  const handleGenerationComplete = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bulk Generate Certificates
          </h1>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">Certificate Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {templateOptions.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {generationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Generation Error</h3>
              <p className="text-sm text-red-800">{generationError}</p>
            </div>
          </div>
        )}

        {selectedTemplate ? (
          <BulkGenerationWorkflow
            template={selectedTemplate}
            onGenerationStart={handleGenerationStart}
            onGenerationComplete={handleGenerationComplete}
          />
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            Please select a template to continue bulk generation.
          </div>
        )}
      </div>
    </div>
  );
}
