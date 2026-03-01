import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { ExcelUploadMapping } from '@/types/CertificateTemplate';

interface ParsedExcelData {
  headers: string[];
  rows: Record<string, string>[];
}

export const useExcelParser = () => {
  const [data, setData] = useState<ParsedExcelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseExcel = useCallback(
    async (file: File): Promise<ParsedExcelData | null> => {
      setLoading(true);
      setError(null);

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, string>[];

        if (jsonData.length === 0) {
          throw new Error('Excel file is empty');
        }

        const headers = Object.keys(jsonData[0]);
        const parsed: ParsedExcelData = {
          headers,
          rows: jsonData,
        };

        setData(parsed);
        return parsed;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to parse Excel file';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const calculateMappings = useCallback(
    (templateVariables: string[], excelHeaders: string[]): ExcelUploadMapping[] => {
      // Simple Levenshtein distance-based matching
      const levenshteinDistance = (a: string, b: string): number => {
        const aLower = a.toLowerCase().replace(/[{}]/g, '');
        const bLower = b.toLowerCase();

        const matrix: number[][] = [];
        for (let i = 0; i <= bLower.length; i++) matrix[i] = [i];
        for (let j = 0; j <= aLower.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= bLower.length; i++) {
          for (let j = 1; j <= aLower.length; j++) {
            if (bLower[i - 1] === aLower[j - 1]) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
            }
          }
        }

        return matrix[bLower.length][aLower.length];
      };

      return templateVariables.map((variable) => {
        let bestMatch = excelHeaders[0];
        let bestScore = levenshteinDistance(variable, bestMatch);

        for (const header of excelHeaders) {
          const score = levenshteinDistance(variable, header);
          if (score < bestScore) {
            bestScore = score;
            bestMatch = header;
          }
        }

        // Normalize score to 0-1 range
        const maxDistance = Math.max(variable.length, bestMatch.length);
        const normalizedScore = 1 - bestScore / maxDistance;

        return {
          targetVariable: variable,
          sourceColumn: bestMatch,
          matchScore: Math.max(0, normalizedScore),
        };
      });
    },
    []
  );

  return {
    data,
    loading,
    error,
    parseExcel,
    calculateMappings,
  };
};
