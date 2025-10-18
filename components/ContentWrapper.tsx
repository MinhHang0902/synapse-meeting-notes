"use client";

import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface ContentWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export default function ContentWrapper({ children, className = "" }: ContentWrapperProps) {
    const { isLoading } = useLoading();

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
                </div>
            )}

            <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
                {children}
            </div>
        </div>
    );
} 