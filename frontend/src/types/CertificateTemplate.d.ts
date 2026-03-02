// Certificate Element Types
export interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'variable' | 'shape';
  label: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  width: number; // Percentage (0-100)
  height: number; // Percentage (0-100)
  rotation: number; // Degrees
  zIndex: number;
  visible: boolean;

  // Text-specific
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '500' | '600' | '700';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;

  // Image-specific
  src?: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  opacity?: number;

  // Shape-specific
  shapeType?: 'rectangle' | 'circle' | 'line';
  borderColor?: string;
  borderWidth?: number;
  strokePosition?: 'inside' | 'center' | 'outside';
  backgroundColor?: string;

  // Effects
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  category?:
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
  isPremium?: boolean;
  orientation: 'portrait' | 'landscape';
  width: number; // mm
  height: number; // mm
  backgroundColor?: string;
  elements: CertificateElement[];
  variables: string[]; // e.g., ['{{Name}}', '{{Title}}', '{{Date}}']
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}

export interface Certificate {
  id: string;
  templateId: string;
  data: Record<string, string>; // { '{{Name}}': 'John Doe', ... }
  pdfUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface ExcelUploadMapping {
  targetVariable: string; // e.g., '{{Name}}'
  sourceColumn: string; // e.g., 'Adı' or 'Name'
  matchScore: number; // 0-1
}

export interface EditorState {
  selectedElementId: string | null;
  isDragging: boolean;
  scale: number; // Canvas zoom level
  offset: { x: number; y: number };
}
