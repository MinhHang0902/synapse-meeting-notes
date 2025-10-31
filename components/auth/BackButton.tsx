'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-gray-300 hover:bg-white/10 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
