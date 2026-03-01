import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor | CertifyPro',
  description: 'Certificate template editor',
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
