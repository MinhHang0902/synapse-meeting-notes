"use client";

import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { Sidebar } from "../layout/sidebar/sidebar";
import { TopBar } from "../layout/topbar";

interface ProtectedLayoutProps { children: ReactNode; }

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const sidebarWidth = useMemo(() => (collapsed ? 72 : 280), [collapsed]);
  const topbarHeight = 100;

  return (
    <div className="min-h-screen flex bg-[#F5F6F8] text-gray-900">
      <aside
        className="fixed inset-y-0 left-0 z-50 h-screen transition-[width] duration-300 border-r border-gray-200 bg-white"
        style={{ width: sidebarWidth }}
      >
        <div className="h-full overflow-y-auto">
          <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-h-screen" style={{ marginLeft: sidebarWidth }}>
        <header
          className="fixed top-0 right-0 z-40 bg-white border-b border-gray-200"
          style={{ left: sidebarWidth, height: topbarHeight }}
        >
          <TopBar />
        </header>

        <main className="px-6 pb-10" style={{ paddingTop: topbarHeight + 16 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
