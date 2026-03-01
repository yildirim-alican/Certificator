import { create } from 'zustand';
import { CertificateTemplate, CertificateElement } from '@/types/CertificateTemplate';

interface EditorStoreState {
  // Template State
  template: CertificateTemplate | null;
  setTemplate: (template: CertificateTemplate) => void;
  updateTemplateMetadata: (name: string, description?: string) => void;

  // Elements State (Single Source of Truth)
  elements: CertificateElement[];
  addElement: (element: CertificateElement) => void;
  updateElement: (id: string, updates: Partial<CertificateElement>) => void;
  deleteElement: (id: string) => void;
  reorderElements: (newElements: CertificateElement[]) => void;

  // Selection State
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;

  // Canvas State
  scale: number;
  setScale: (scale: number) => void;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;

  // View State
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  showGuides: boolean;
  setShowGuides: (showGuides: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snapToGrid: boolean) => void;
  selectionColor: string;
  setSelectionColor: (selectionColor: string) => void;

  // Reset
  reset: () => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  template: null,
  setTemplate: (template) => set({ template }),
  updateTemplateMetadata: (name, description) =>
    set((state) => ({
      template: state.template
        ? { ...state.template, name, description: description || state.template.description }
        : null,
    })),

  elements: [],
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    })),

  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })),

  reorderElements: (newElements) => set({ elements: newElements }),

  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),

  scale: 1,
  setScale: (scale) => set({ scale }),

  offset: { x: 0, y: 0 },
  setOffset: (offset) => set({ offset }),

  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),

  showGuides: true,
  setShowGuides: (showGuides) => set({ showGuides }),

  snapToGrid: true,
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

  selectionColor: '#3b82f6',
  setSelectionColor: (selectionColor) => set({ selectionColor }),

  reset: () =>
    set({
      template: null,
      elements: [],
      selectedElementId: null,
      scale: 1,
      offset: { x: 0, y: 0 },
      isDragging: false,
      showGuides: true,
      snapToGrid: true,
      selectionColor: '#3b82f6',
    }),
}));
