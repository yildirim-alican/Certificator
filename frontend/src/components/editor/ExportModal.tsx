'use client';

import React, { useState } from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import { usePrinter } from '@/hooks/usePrinter';
import Button from '@/components/shared/Button';
import { Download, X, Eye, Loader } from 'lucide-react';

interface ExportModalProps {
  template: CertificateTemplate;
  data?: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ExportModal Component
 *
 * Modal for PDF preview and download options:
 * - Preview before download
 * - Download single PDF
 * - Options for file name and format
 */
const ExportModal: React.FC<ExportModalProps> = ({
  template,
  data = {},
  isOpen,
  onClose,
}) => {
  const { generatePDF, generatePreview } = usePrinter();
  const [fileName, setFileName] = useState(`${template.name}.pdf`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePreview = async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      const result = await generatePreview(template, data);
      setPreviewUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await generatePDF(template, data, { fileName });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Export Certificate</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="border-r border-gray-200 pr-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

            {previewUrl ? (
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border border-gray-300 rounded"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 mb-4 flex flex-col items-center justify-center h-96">
                {previewLoading ? (
                  <>
                    <Loader className="animate-spin text-blue-600 mb-2" size={32} />
                    <p className="text-gray-600">Generating preview...</p>
                  </>
                ) : (
                  <>
                    <Eye className="text-gray-400 mb-2" size={48} />
                    <p className="text-gray-600 text-center">
                      Click "Generate Preview" to see how your certificate will look
                    </p>
                  </>
                )}
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handleGeneratePreview}
              disabled={previewLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              {previewLoading ? 'Generating...' : 'Generate Preview'}
            </Button>
          </div>

          {/* Download Section */}
          <div className="pl-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="certificate.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  File will be saved with .pdf extension
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Specifications</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Resolution: 300 DPI (Professional)</li>
                  <li>✓ Format: PDF (A4 {template.orientation})</li>
                  <li>✓ Quality: Pixel-perfect rendering</li>
                  <li>✓ Size: ~{Math.ceil(template.width / 10)}mm × {Math.ceil(template.height / 10)}mm</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Certificate Data</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {Object.entries(data).length > 0 ? (
                    Object.entries(data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span className="text-gray-500">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No data provided</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {isGenerating ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
