'use client';

/**
 * Create New Template Page
 *
 * Form for creating a new certificate template with:
 * - Name and description
 * - Orientation (portrait/landscape)
 * - Background color
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useApi } from '@/hooks/useApi';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { ArrowRight } from 'lucide-react';
import { v4 as uuid } from 'crypto';

export default function CreateTemplatePage() {
  const router = useRouter();
  const { post } = useApi();
  const addTemplate = useTemplateStore((state) => state.addTemplate);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    orientation: 'portrait' as 'portrait' | 'landscape',
    backgroundColor: '#ffffff',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const templateId = Math.random().toString(36).substring(7);

      const newTemplate = {
        id: templateId,
        name: formData.name,
        description: formData.description,
        orientation: formData.orientation,
        width: 210,
        height: formData.orientation === 'landscape' ? 210 : 297,
        backgroundColor: formData.backgroundColor,
        elements: [],
        variables: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: Call API to create template
      // const { data } = await post('/templates', newTemplate);

      // For now, just add to store and navigate
      addTemplate(newTemplate);

      // Navigate to editor
      router.push(`/editor/${templateId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Template</h1>
        <p className="text-gray-600 mb-6">Start designing your certificate</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="Template Name"
            type="text"
            placeholder="e.g., Employee Achievement"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
            <div className="grid grid-cols-2 gap-3">
              {(['portrait', 'landscape'] as const).map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  onClick={() => setFormData({ ...formData, orientation })}
                  className={`
                    p-4 rounded-lg border-2 transition-colors text-sm font-medium
                    ${
                      formData.orientation === orientation
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div
                    className={`
                      mx-auto mb-2 rounded
                      ${orientation === 'portrait' ? 'w-8 h-12' : 'w-12 h-8'}
                      ${
                        formData.orientation === orientation
                          ? 'bg-blue-200'
                          : 'bg-gray-200'
                      }
                    `}
                  />
                  {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <Input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={!formData.name || isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating...' : 'Create Template'}
            <ArrowRight size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
