'use client';

import React from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';
import Button from '@/components/shared/Button';
import { LayoutTemplate, CheckCircle2 } from 'lucide-react';

export interface SystemLayoutPreset {
  id: string;
  name: string;
  description: string;
  variables: string[];
  elements: CertificateElement[];
}

interface SystemLayoutPickerProps {
  presets: SystemLayoutPreset[];
  activePresetId: string | null;
  onApplyPreset: (preset: SystemLayoutPreset) => void;
}

const SystemLayoutPicker: React.FC<SystemLayoutPickerProps> = ({
  presets,
  activePresetId,
  onApplyPreset,
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto max-h-screen">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">System Layouts</h3>
      <p className="text-sm text-gray-600 mb-6">
        Choose a ready-made certificate layout created by the system.
      </p>

      <div className="space-y-4">
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <div
              key={preset.id}
              className={`border rounded-lg p-4 transition ${
                isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                </div>
                {isActive ? <CheckCircle2 className="text-blue-600" size={18} /> : <LayoutTemplate className="text-gray-400" size={18} />}
              </div>

              <div className="text-xs text-gray-600 mb-3">
                Variables: {preset.variables.join(', ')}
              </div>

              <Button
                variant={isActive ? 'secondary' : 'primary'}
                onClick={() => onApplyPreset(preset)}
                className="w-full"
              >
                {isActive ? 'Re-Apply Layout' : 'Use This Layout'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemLayoutPicker;
