'use client';

import React from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import Button from '@/components/shared/Button';

interface CertCardProps {
  template: CertificateTemplate;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * CertCard Component
 *
 * Dashboard card for displaying certificate templates.
 * Shows template preview, name, and action buttons.
 */
const CertCard: React.FC<CertCardProps> = ({ template, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Template Thumbnail */}
      <div className="bg-gray-100 h-40 flex items-center justify-center">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-500">No Preview</p>
            <p className="text-xs text-gray-400">{template.orientation}</p>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description || 'No description'}
        </p>

        {/* Variables */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Variables</p>
          <div className="flex flex-wrap gap-1">
            {template.variables.map((variable) => (
              <span
                key={variable}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {variable}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onEdit?.(template.id)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete?.(template.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertCard;
