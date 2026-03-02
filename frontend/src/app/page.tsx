'use client';

/**
 * Dashboard Page
 *
 * Main landing page showing all certificate templates.
 * Features template listing, search, category filtering, and create new template.
 * Minimal 2-column layout with category-based filtering.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useApi } from '@/hooks/useApi';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import CertCard from '@/components/dashboard/CertCard';
import Input from '@/components/shared/Input';
import { Search } from 'lucide-react';
import { CERTIFICATE_TYPES } from '@/lib/premiumTemplates';

type CategoryType =
  | 'all'
  | 'achievement'
  | 'participation'
  | 'completion'
  | 'award'
  | 'diploma'
  | 'training'
  | 'workshop'
  | 'webinar'
  | 'internship'
  | 'honor';

export default function Dashboard() {
  const router = useRouter();
  const templates = useTemplateStore((state) => state.templates);
  const setTemplates = useTemplateStore((state) => state.setTemplates);
  const { get } = useApi();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [loading, setLoading] = useState(true);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      const { data } = await get<CertificateTemplate[]>('/templates');
      if (data) {
        setTemplates(data);
      }
      setLoading(false);
    };

    loadTemplates();
  }, []);

  // Filter templates by search query and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const updatedTemplates = templates.filter((t) => t.id !== templateId);
          setTemplates(updatedTemplates);
        } else {
          alert('Failed to delete template');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting template');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal Design */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Certificate Templates</h1>
              <p className="text-sm text-gray-600 mt-1">Choose a template and customize it</p>
            </div>
            <button
              onClick={() => router.push('/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Certificate
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs - Minimal Design */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CERTIFICATE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedCategory(type.id as CategoryType)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                selectedCategory === type.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No templates found</p>
            <p className="text-gray-500 mt-2 text-sm">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Templates Grid - 2 Columns */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <CertCard
                key={template.id}
                template={template}
                onEdit={() => router.push(`/editor/${template.id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
