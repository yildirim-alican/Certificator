'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTemplatePage() {
  const router = useRouter();

  useEffect(() => {
    const templateId = `template-${Date.now()}`;
    router.replace(`/editor/${templateId}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-600">Redirecting to design editor...</p>
    </div>
  );
}
