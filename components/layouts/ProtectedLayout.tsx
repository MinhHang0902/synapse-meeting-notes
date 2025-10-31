"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "../layout/sidebar/sidebar";
import { TopBar } from "../layout/topbar";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AuthApi } from "@/lib/api/auth";
import { isTokenExpired } from "@/lib/utils/jwt";

interface ProtectedLayoutProps { children: ReactNode; }

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const locale = useLocale();

  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const sidebarWidth = useMemo(() => (collapsed ? 72 : 280), [collapsed]);
  const topbarHeight = 100;

  const loginPath = useMemo(() => `/${locale}/auth/sign-in`, [locale]);

  useEffect(() => {
    let cancelled = false;

    const ensureAuth = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        const refreshToken = Cookies.get("refresh_token");

        if (!accessToken) {
          router.replace(loginPath);
          return;
        }

        if (!isTokenExpired(accessToken)) {
          if (!cancelled) {
            setAuthed(true);
          }
          return;
        }

        if (refreshToken) {
          try {
            const res = await AuthApi.refreshToken({ refreshToken });
            const newAccessToken = res.accessToken;
            const newRefreshToken = res.refreshToken;

            if (!newAccessToken) {
              router.replace(loginPath);
              return;
            }

            Cookies.set("access_token", newAccessToken, {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            if (newRefreshToken) {
              Cookies.set("refresh_token", newRefreshToken, {
                expires: 30,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              });
            }

            if (!cancelled) setAuthed(true);
            return;
          } catch {
            router.replace(loginPath);
            return;
          }
        }

        router.replace(loginPath);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    ensureAuth();
    return () => {
      cancelled = true;
    };
  }, [router, loginPath]);

  if (checking || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

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
