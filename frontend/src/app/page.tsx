'use client';

/**
 * Dashboard Page
 *
 * Main landing page showing all certificate templates.
 * Features template listing, search, and create new template.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useApi } from '@/hooks/useApi';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import CertCard from '@/components/dashboard/CertCard';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Search } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const templates = useTemplateStore((state) => state.templates);
  const setTemplates = useTemplateStore((state) => state.setTemplates);
  const { get } = useApi();

  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter templates by search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    // Navigate to editor
    router.push(`/editor/${id}`);
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete
    console.log('Delete template:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">CertifyPro</h1>
          <p className="text-gray-600 mt-1">Certificate Management System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar & Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="primary" onClick={() => router.push('/create')}>
            New Template
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No templates found</p>
            <p className="text-gray-400 mt-2">Create a new template to get started</p>
          <Button variant="primary" onClick={() => router.push('/create')} className="mt-6">
            Create First Template
          </Button>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <CertCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
