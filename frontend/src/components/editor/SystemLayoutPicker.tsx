'use client';

import React, { useMemo, useState } from 'react';
import Button from '@/components/shared/Button';
import { LayoutTemplate, CheckCircle2, Crown, Layers, Palette } from 'lucide-react';
import {
  LayoutCategory,
  LayoutOrientation,
  SystemLayoutPreset,
} from '@/components/editor/systemPresets';

interface SystemLayoutPickerProps {
  presets: SystemLayoutPreset[];
  activePresetId: string | null;
  activeOrientation: LayoutOrientation;
  onApplyPreset: (preset: SystemLayoutPreset) => void;
  onOrientationChange: (orientation: LayoutOrientation) => void;
  onIssuerLogoUpload: (file: File) => void;
  onSponsorLogoUpload: (file: File, logoIndex?: number) => void;
}

const SystemLayoutPicker: React.FC<SystemLayoutPickerProps> = ({
  presets,
  activePresetId,
  activeOrientation,
  onApplyPreset,
  onOrientationChange,
  onIssuerLogoUpload,
  onSponsorLogoUpload,
}) => {
  const [activeCategory, setActiveCategory] = useState<LayoutCategory>('digital');

  const visiblePresets = useMemo(
    () => presets.filter((preset) => preset.category === activeCategory && preset.orientation === activeOrientation),
    [presets, activeCategory, activeOrientation]
  );

  const categoryOptions: Array<{ id: LayoutCategory; label: string; icon: React.ReactNode }> = [
    { id: 'digital', label: 'Digital', icon: <Layers size={14} /> },
    { id: 'minimal', label: 'Minimal', icon: <Palette size={14} /> },
    { id: 'modern', label: 'Modern', icon: <Crown size={14} /> },
  ];

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Certificate Layout Library</h3>
        <p className="text-sm text-gray-600">
          Pick a premium starter layout, then fine-tune details in Quick Edit.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">A4 Orientation</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeOrientation === 'portrait' ? 'primary' : 'secondary'}
            onClick={() => onOrientationChange('portrait')}
            className="w-full"
          >
            A4 Portrait
          </Button>
          <Button
            variant={activeOrientation === 'landscape' ? 'primary' : 'secondary'}
            onClick={() => onOrientationChange('landscape')}
            className="w-full"
          >
            A4 Landscape
          </Button>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Certificate Type</div>
        <div className="space-y-2">
          {categoryOptions.map((option) => {
            const isActive = activeCategory === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setActiveCategory(option.id)}
                className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between transition ${
                  isActive
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                {isActive && <CheckCircle2 size={16} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Brand Assets</div>
        <div className="space-y-2">
          <label className="block text-xs text-gray-600">Issuer Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onIssuerLogoUpload(file);
            }}
            className="w-full text-xs border border-gray-300 rounded px-2 py-2"
          />

          <label className="block text-xs text-gray-600 mt-2">Sponsor Logo</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach((file, index) => onSponsorLogoUpload(file, index));
            }}
            className="w-full text-xs border border-gray-300 rounded px-2 py-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        {visiblePresets.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <div
              key={preset.id}
              className={`border rounded-xl p-4 transition shadow-sm ${
                isActive
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                </div>
                {isActive ? <CheckCircle2 className="text-blue-600" size={18} /> : <LayoutTemplate className="text-gray-400" size={18} />}
              </div>

              <div className="mb-3 h-14 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex items-center px-3">
                <div className="w-2 h-8 rounded-full bg-blue-400 mr-3" />
                <div className="space-y-1 w-full">
                  <div className="h-2 w-2/3 rounded bg-gray-300" />
                  <div className="h-2 w-1/2 rounded bg-gray-200" />
                </div>
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

        {visiblePresets.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-600">
            No templates found for this type and orientation.
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLayoutPicker;
