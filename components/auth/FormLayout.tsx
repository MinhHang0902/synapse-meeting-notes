'use client';

import * as React from 'react';

export default function FormLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
