import { useCallback, useRef } from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import { useApi } from './useApi';
import { serializeTemplateForPDF } from '@/utils/htmlGenerator';

interface PrintOptions {
  format?: 'pdf' | 'png';
  fileName?: string;
}

export const usePrinter = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { post } = useApi();

  /**
   * Generate PDF via backend (Playwright)
   *
   * Backend will:
   * 1. Render HTML to 3508x2480px (300 DPI A4)
   * 2. Apply CSS print media queries
   * 3. Return PDF blob
   */
  const generatePDF = useCallback(
    async (
      template: CertificateTemplate,
      data: Record<string, string> = {},
      options: PrintOptions = {}
    ) => {
      const { fileName = `${template.name}.pdf` } = options;

      try {
        // Serialize template for backend
        const payload = serializeTemplateForPDF(template, data);

        // Call backend PDF generation endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pdf/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`PDF generation failed: ${response.statusText}`);
        }

        // Get PDF blob
        const blob = await response.blob();

        // Download file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: 'PDF generated and downloaded successfully',
          fileName,
        };
      } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
      }
    },
    [post]
  );

  /**
   * Generate preview (returns URL)
   */
  const generatePreview = useCallback(
    async (
      template: CertificateTemplate,
      data: Record<string, string> = {}
    ) => {
      try {
        const payload = serializeTemplateForPDF(template, data);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pdf/preview`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Preview generation failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return {
          success: true,
          url,
          blob,
        };
      } catch (error) {
        console.error('Preview generation error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Bulk generate PDFs (for multiple certificates)
   */
  const generateBulkPDFs = useCallback(
    async (
      template: CertificateTemplate,
      dataArray: Record<string, string>[],
      options: { fileName?: string; format?: 'zip' | 'individual' } = {}
    ) => {
      const { fileName = 'certificates.zip', format = 'zip' } = options;

      try {
        const payload = {
          template: {
            name: template.name,
            orientation: template.orientation,
            width: template.width,
            height: template.height,
            backgroundColor: template.backgroundColor,
            elements: template.elements,
          },
          dataArray,
          format,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pdf/generate-bulk`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Bulk PDF generation failed: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Download file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Generated ${dataArray.length} certificates`,
          count: dataArray.length,
        };
      } catch (error) {
        console.error('Bulk PDF generation error:', error);
        throw error;
      }
    },
    []
  );

  return {
    canvasRef,
    generatePDF,
    generatePreview,
    generateBulkPDFs,
  };
};
