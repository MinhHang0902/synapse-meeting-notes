'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordField({
  value,
  onChange,
  placeholder = '••••••••',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1">
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-visible:ring-white/20 rounded-lg ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
