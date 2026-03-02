/**
 * Premium Certificate Templates Configuration
 * 
 * Defines 6 categories with 15+ premium templates
 * Supports multiple sponsor logos and advanced customization
 */

export interface CertificateCategory {
  id:
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
  name: string;
  icon: string;
  description: string;
}

export const CERTIFICATE_TYPES: CertificateCategory[] = [
  {
    id: 'achievement',
    name: 'Achievement',
    icon: '🏆',
    description: 'Award certificates for exceptional accomplishments',
  },
  {
    id: 'participation',
    name: 'Participation',
    icon: '🎖️',
    description: 'Recognition for active participation in events',
  },
  {
    id: 'completion',
    name: 'Completion',
    icon: '✅',
    description: 'Certificates confirming course/program completion',
  },
  {
    id: 'award',
    name: 'Award',
    icon: '⭐',
    description: 'Special awards and honors recognition',
  },
  {
    id: 'diploma',
    name: 'Diploma',
    icon: '🎓',
    description: 'Professional diplomas and credentials',
  },
  {
    id: 'training',
    name: 'Training',
    icon: '📚',
    description: 'Training and skill development certificates',
  },
  {
    id: 'workshop',
    name: 'Workshop',
    icon: '🛠️',
    description: 'Hands-on workshop attendance and completion certificates',
  },
  {
    id: 'webinar',
    name: 'Webinar',
    icon: '💻',
    description: 'Online event and webinar participation certificates',
  },
  {
    id: 'internship',
    name: 'Internship',
    icon: '🏢',
    description: 'Internship completion and performance certificates',
  },
  {
    id: 'honor',
    name: 'Honor',
    icon: '🏅',
    description: 'Honor and distinction recognition certificates',
  },
];

/**
 * Premium Template Definitions (15+ templates)
 */
export const PREMIUM_TEMPLATES = [
  {
    id: 'premium-modern-1',
    name: 'Modern Professional',
    category: 'achievement' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-elegant-1',
    name: 'Elegant Gold',
    category: 'award' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-corporate-1',
    name: 'Corporate Blue',
    category: 'completion' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-tech-1',
    name: 'Tech Gradient',
    category: 'training' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-minimal-1',
    name: 'Minimal Clean',
    category: 'participation' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-diploma-1',
    name: 'Formal Diploma',
    category: 'diploma' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-vibrant-1',
    name: 'Vibrant Colors',
    category: 'achievement' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-prestige-1',
    name: 'Prestige Classic',
    category: 'award' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-nature-1',
    name: 'Nature Inspired',
    category: 'achievement' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-azure-1',
    name: 'Azure Sky',
    category: 'completion' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-rose-1',
    name: 'Rose Garden',
    category: 'participation' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-forest-1',
    name: 'Forest Green',
    category: 'diploma' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-sunset-1',
    name: 'Sunset Gold',
    category: 'award' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-ocean-1',
    name: 'Ocean Wave',
    category: 'training' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-crown-1',
    name: 'Royal Crown',
    category: 'achievement' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-abstract-1',
    name: 'Abstract Modern',
    category: 'completion' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-workshop-1',
    name: 'Workshop Mastery',
    category: 'workshop' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-webinar-1',
    name: 'Webinar Spotlight',
    category: 'webinar' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-internship-1',
    name: 'Internship Excellence',
    category: 'internship' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
  {
    id: 'premium-honor-1',
    name: 'Honor Distinction',
    category: 'honor' as const,
    isPremium: true,
    variables: ['{{recipientFullName}}', '{{certificateDate}}'],
  },
];
