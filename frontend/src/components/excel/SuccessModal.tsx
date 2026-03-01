'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, ArrowRight, X } from 'lucide-react';
import Button from '@/components/shared/Button';

interface SuccessModalProps {
  isOpen: boolean;
  certificateCount: number;
  fileName: string;
  templateName: string;
  onClose: () => void;
  onDownload?: () => void;
  onNewBatch?: () => void;
}

/**
 * Success Modal Component
 *
 * Displayed when bulk certificate generation is complete
 * Shows:
 * - Success message with checkmark animation
 * - Number of certificates generated
 * - File information
 * - Action buttons
 */
export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  certificateCount,
  fileName,
  templateName,
  onClose,
  onDownload,
  onNewBatch,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(false);
      const timer = setTimeout(() => setShowAnimation(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-2 left-4 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>
            🎉
          </div>
          <div className="absolute top-2 right-4 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '0.2s' }}>
            🎊
          </div>

          {/* Success Checkmark */}
          <div className="relative inline-block mb-4">
            <div
              className={`
                w-20 h-20 rounded-full bg-white flex items-center justify-center
                transform transition-all duration-700
                ${showAnimation ? 'scale-100' : 'scale-0'}
              `}
            >
              <CheckCircle className="text-green-600 w-full h-full" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            Success!
          </h2>
          <p className="text-green-100 text-sm">
            Your certificates are ready to download
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {certificateCount}
              </div>
              <div className="text-xs text-blue-700 font-medium mt-1">
                Certificates
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-600">
                {(certificateCount * 0.05).toFixed(1)} MB
              </div>
              <div className="text-xs text-purple-700 font-medium mt-1">
                File Size
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Template
            </div>
            <div className="font-semibold text-gray-900 truncate">
              {templateName}
            </div>

            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-3">
              Download File
            </div>
            <div className="font-mono text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 truncate">
              {fileName}_batch.zip
            </div>

            <div className="text-xs text-gray-500 mt-3">
              ✓ All {certificateCount} PDFs compressed in one ZIP file
            </div>
          </div>

          {/* Benefits Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              </div>
              Professional PDF format
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              </div>
              300 DPI print quality
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              </div>
              Ready to distribute
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-3">
          <Button
            variant="primary"
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download ZIP
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={onNewBatch}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <ArrowRight size={16} />
              New Batch
            </Button>

            <Button
              variant="secondary"
              onClick={onClose}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <ArrowRight size={16} />
              Done
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
