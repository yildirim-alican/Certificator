import { create } from 'zustand';
import { CertificateTemplate } from '@/types/CertificateTemplate';

interface TemplateStoreState {
  templates: CertificateTemplate[];
  loading: boolean;
  error: string | null;

  setTemplates: (templates: CertificateTemplate[]) => void;
  addTemplate: (template: CertificateTemplate) => void;
  updateTemplate: (id: string, template: CertificateTemplate) => void;
  deleteTemplate: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTemplateStore = create<TemplateStoreState>((set) => ({
  templates: [],
  loading: false,
  error: null,

  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),

  updateTemplate: (id, template) =>
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? template : t)),
    })),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
