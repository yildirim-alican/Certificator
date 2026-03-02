'use client';

import React, { useState } from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { X, Download, Eye, Loader, Plus, Trash2 } from 'lucide-react';
import { usePrinter } from '@/hooks/usePrinter';

export interface QuickEditData {
  recipientFullName: string;
  certificateDate: string;
  sponsorLogos?: string[];
  additionalData?: Record<string, string>;
}

interface QuickEditProps {
  template: CertificateTemplate;
  isOpen: boolean;
  onClose: () => void;
  onGenerate?: (data: QuickEditData) => void;
}

/**
 * QuickEdit Component
 *
 * Modal for quickly generating certificates with:
 * - Recipient information
 * - Certificate date
 * - Multiple sponsor logos
 * - PDF preview
 */
const QuickEdit: React.FC<QuickEditProps> = ({ template, isOpen, onClose, onGenerate }) => {
  const { generatePreview, generatePDF } = usePrinter();
  const [recipientName, setRecipientName] = useState('');
  const [certificateDate, setCertificateDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sponsorLogos, setSponsorLogos] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSponsorLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = event.target.files;
    if (files && files[0]) {
      const newLogos = [...sponsorLogos];
      newLogos[index] = files[0];
      setSponsorLogos(newLogos);
    }
  };

  const handleAddSponsorLogo = () => {
    setSponsorLogos([...sponsorLogos, new File([], '')]);
  };

  const handleRemoveSponsorLogo = (index: number) => {
    setSponsorLogos(sponsorLogos.filter((_, i) => i !== index));
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Invalid file content'));
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });

  const buildDataPayload = () => {
    const parts = recipientName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || recipientName.trim();
    const surname = parts.length > 1 ? parts.slice(1).join(' ') : firstName;

    return {
      recipientFullName: recipientName,
      certificateDate,
      '[recipient.name]': firstName,
      '[recipient.surname]': surname,
      '[certificate.issued_on]': certificateDate,
      '{{recipientFullName}}': recipientName,
      '{{certificateDate}}': certificateDate,
    };
  };

  const buildTemplateWithSponsors = async () => {
    const logoDataUrls = await Promise.all(
      sponsorLogos
        .filter((file) => file && file.size > 0)
        .map((file) => fileToDataUrl(file))
    );

    const nextTemplate: CertificateTemplate = {
      ...template,
      elements: template.elements.map((element) => {
        if (element.type !== 'image') {
          return element;
        }
        const label = element.label.toLowerCase();
        if (!label.includes('sponsor logo')) {
          return element;
        }

        const matched = label.match(/sponsor logo\s*(\d+)/i);
        const logoIndex = matched ? Math.max(parseInt(matched[1], 10) - 1, 0) : 0;
        const src = logoDataUrls[logoIndex] || element.src;
        return { ...element, src };
      }),
    };

    return { nextTemplate, logoDataUrls };
  };

  const handleGeneratePreview = async () => {
    if (!recipientName.trim()) {
      setError('Please enter recipient name for preview');
      return;
    }

    setShowPreview(true);
    setPreviewLoading(true);
    setError(null);

    try {
      const { nextTemplate } = await buildTemplateWithSponsors();
      const result = await generatePreview(nextTemplate, buildDataPayload());
      setPreviewUrl(result.url);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!recipientName.trim()) {
      alert('Please enter recipient name');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const { nextTemplate, logoDataUrls } = await buildTemplateWithSponsors();
      const payload: QuickEditData = {
        recipientFullName: recipientName,
        certificateDate,
        sponsorLogos: logoDataUrls,
        additionalData: {},
      };

      onGenerate?.(payload);

      await generatePDF(nextTemplate, buildDataPayload(), {
        fileName: `${template.name}-${recipientName.replace(/\s+/g, '_')}.pdf`,
      });

      onClose();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Quick Generate Certificate</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 text-sm">Preview</h4>
              <button
                onClick={handleGeneratePreview}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye size={14} />
                Generate
              </button>
            </div>

            {showPreview && previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-48 border border-gray-300 rounded"
                title="Certificate Preview"
              />
            ) : showPreview && previewLoading ? (
              <div className="bg-white rounded p-6 h-48 flex items-center justify-center border border-gray-300">
                <Loader className="animate-spin text-blue-600 mr-2" size={20} />
                <p className="text-sm text-gray-600">Generating preview...</p>
              </div>
            ) : (
              <div className="bg-white rounded p-6 h-24 flex items-center justify-center border border-dashed border-gray-300">
                <p className="text-xs text-gray-500 text-center">
                  Fill details and click "Generate" to preview your certificate
                </p>
              </div>
            )}

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>

          {/* Form Section */}
          <div className="border-t border-gray-200 pt-4">
            {/* Recipient Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Full Name *
              </label>
              <Input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full"
              />
            </div>

            {/* Certificate Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Date
              </label>
              <Input
                type="date"
                value={certificateDate}
                onChange={(e) => setCertificateDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Sponsor Logos */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sponsor Logos
                </label>
                <button
                  onClick={handleAddSponsorLogo}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {sponsorLogos.length === 0 ? (
                <p className="text-xs text-gray-500">No logos added yet</p>
              ) : (
                <div className="space-y-2">
                  {sponsorLogos.map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSponsorLogoUpload(e, idx)}
                        className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5"
                      />
                      <button
                        onClick={() => handleRemoveSponsorLogo(idx)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-4 flex gap-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={isGenerating || !recipientName.trim()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {isGenerating ? 'Generating...' : 'Download'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickEdit;
