'use client';

import React, { useState, useRef } from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import { useExcelParser } from '@/hooks/useExcelParser';
import { useConfetti } from '@/hooks/useConfetti';
import ExcelUploader from '@/components/excel/ExcelUploader';
import ColumnMapper from '@/components/excel/ColumnMapper';
import DataPreview from '@/components/excel/DataPreview';
import SuccessModal from '@/components/excel/SuccessModal';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface BulkGenerationProps {
  template: CertificateTemplate;
  onGenerationStart: (data: Record<string, string>[]) => Promise<void>;
  onGenerationComplete?: () => void;
}

type WorkflowStep = 'upload' | 'mapping' | 'preview' | 'generating' | 'complete';

/**
 * Bulk Certificate Generation Workflow
 *
 * Steps:
 * 1. Upload Excel file
 * 2. Map columns to template variables
 * 3. Preview data
 * 4. Generate and download ZIP
 */
export const BulkGenerationWorkflow: React.FC<BulkGenerationProps> = ({
  template,
  onGenerationStart,
  onGenerationComplete,
}) => {
  const { parseExcel, calculateMappings } = useExcelParser();
  const { triggerConfetti } = useConfetti();
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [excelData, setExcelData] = useState<{
    headers: string[];
    rows: Record<string, string>[];
  } | null>(null);
  const [columnMappings, setColumnMappings] = useState<
    Array<{ excelColumn: string; templateVariable: string; confidence: number }>
  >([]);
  const [mappedData, setMappedData] = useState<Record<string, string>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const allowedVariables = ['[recipient.name]', '[recipient.surname]', '[certificate.success_rate]'];

  const templateVariables = (() => {
    const filtered = (template?.variables || []).filter((variable) =>
      allowedVariables.includes(variable)
    );
    return filtered.length > 0 ? filtered : ['[recipient.name]', '[recipient.surname]'];
  })();

  // Step 1: File Upload
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parseExcel(file);
      if (result) {
        setExcelData(result);

        // Auto-map columns
        const autoMappings = calculateMappings(templateVariables, result.headers).map(
          (mapping) => ({
            excelColumn: mapping.sourceColumn,
            templateVariable: mapping.targetVariable,
            confidence: mapping.matchScore,
          })
        );
        setColumnMappings(autoMappings);

        setStep('mapping');
      }
    } catch (err) {
      setError('Failed to parse Excel file');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Column Mapping
  const handleMappingComplete = (
    mappings: Array<{ excelColumn: string; templateVariable: string; confidence: number }>
  ) => {
    if (!excelData) return;

    // Transform data using mappings
    const transformed = excelData.rows.map((row) => {
      const transformedRow: Record<string, string> = {};
      mappings.forEach((mapping) => {
        if (mapping.templateVariable) {
          transformedRow[mapping.templateVariable] = row[mapping.excelColumn] || '';
        }
      });
      return transformedRow;
    });

    setMappedData(transformed);
    setColumnMappings(mappings);
    setStep('preview');
  };

  // Step 3: Preview
  const handlePreviewConfirm = async () => {
    if (!mappedData) return;

    setIsLoading(true);
    setError(null);
    setStep('generating');

    try {
      await onGenerationStart(mappedData);
      setStep('complete');
      
      // Trigger confetti effect
      if (containerRef.current) {
        triggerConfetti(containerRef.current);
      }
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificates');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepNumber = (): number => {
    switch (step) {
      case 'upload':
        return 1;
      case 'mapping':
        return 2;
      case 'preview':
        return 3;
      case 'generating':
      case 'complete':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto" ref={containerRef}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          {['Upload', 'Map', 'Review', 'Generate'].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition
                  ${
                    idx + 1 < getStepNumber()
                      ? 'bg-green-500 text-white'
                      : idx + 1 === getStepNumber()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {idx + 1 < getStepNumber() ? <CheckCircle size={20} /> : idx + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  idx + 1 <= getStepNumber() ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
              {idx < 3 && (
                <ArrowRight className="mx-4 text-gray-300" size={20} />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((getStepNumber() - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {step === 'upload' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Certificate Data</h2>
            <ExcelUploader
              onFileSelect={handleFileSelect}
              onError={setError}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === 'mapping' && excelData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Match Your Data</h2>
            <ColumnMapper
              excelColumns={excelData.headers}
              templateVariables={templateVariables}
              autoMappings={columnMappings}
              onMappingComplete={handleMappingComplete}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === 'preview' && mappedData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Before Generation</h2>
            <DataPreview
              data={mappedData}
              columns={templateVariables}
              totalRecords={mappedData.length}
              onConfirm={handlePreviewConfirm}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === 'generating' && (
          <div className="space-y-6 text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="animate-spin">
                <CheckCircle className="text-blue-600" size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Generating Certificates</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your certificates are being generated. This may take a few moments depending on
              the number of records.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                {mappedData?.length} certificates being created...
              </p>
            </div>
          </div>
        )}

        {step === 'complete' && mappedData && (
          <div className="space-y-6 text-center py-12">
            <p className="text-gray-600">
              Generation complete! Check the success modal for details.
            </p>
          </div>
        )}
      </div>

      {/* Success Modal with Confetti */}
      {mappedData && (
        <SuccessModal
          isOpen={showSuccessModal}
          certificateCount={mappedData.length}
          fileName={template?.name.replace(/\s+/g, '-').toLowerCase() || 'certificates'}
          templateName={template?.name || 'Certificate'}
          onClose={() => {
            setShowSuccessModal(false);
            onGenerationComplete?.();
          }}
          onDownload={() => {
            // Download is already handled by the backend
            // This is just a confirmation action
          }}
          onNewBatch={() => {
            setShowSuccessModal(false);
            setStep('upload');
            setExcelData(null);
            setMappedData(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
};

export default BulkGenerationWorkflow;
