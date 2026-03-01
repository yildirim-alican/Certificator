'use client';

import React, { useMemo, useState } from 'react';
import Button from '@/components/shared/Button';
import { LayoutTemplate, CheckCircle2 } from 'lucide-react';
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
}

const SystemLayoutPicker: React.FC<SystemLayoutPickerProps> = ({
  presets,
  activePresetId,
  activeOrientation,
  onApplyPreset,
  onOrientationChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<LayoutCategory>('digital');

  const visiblePresets = useMemo(
    () => presets.filter((preset) => preset.category === activeCategory && preset.orientation === activeOrientation),
    [presets, activeCategory, activeOrientation]
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">System Layouts</h3>
      <p className="text-sm text-gray-600 mb-6">
        Choose a ready-made certificate layout created by the system.
      </p>

      <div className="mb-4">
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

      <div className="mb-5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Certificate Type</div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeCategory === 'digital' ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory('digital')}
            className="w-full text-xs"
          >
            Digital
          </Button>
          <Button
            variant={activeCategory === 'minimal' ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory('minimal')}
            className="w-full text-xs"
          >
            Minimal
          </Button>
          <Button
            variant={activeCategory === 'modern' ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory('modern')}
            className="w-full text-xs"
          >
            Modern
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {visiblePresets.map((preset) => {
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
