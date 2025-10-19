"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Eye, FolderKanban, FileText, Settings, Heart,
  MoreHorizontal, ChevronLeft, ChevronRight,
  UserRound, KeyRound, LogOut, X, PencilLine, EyeOff
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import MyAccountModal from "./sidebar-account-modal";
import ChangePasswordModal from "./sidebar-changepassword-modal";



/* =========================
   Sidebar
   ========================= */

type NavItem = {
  key: "dashboard" | "projects" | "meetings" | "settings" | "guidance";
  href: string;
  icon: React.ElementType;
  match?: "exact" | "startsWith";
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/pages/dashboard", icon: Eye, match: "startsWith" },
  { key: "projects", href: "/pages/projects", icon: FolderKanban, match: "startsWith" },
  { key: "meetings", href: "/pages/meetings", icon: FileText, match: "startsWith" },
];

const NAV_FOOTER: NavItem[] = [
  { key: "settings", href: "/pages/settings", icon: Settings, match: "startsWith" },
  { key: "guidance", href: "/pages/guidance", icon: Heart, match: "startsWith" },
];

export function Sidebar({
  collapsed = false,
  toggleCollapsed,
}: {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
}) {
  const pathname = usePathname();
  const intlLocale = safeUseLocale();
  const locale = intlLocale ?? (useParams() as any)?.locale ?? "en";
  const t = safeUseTranslations("nav");

  const trimLocale = (p: string) =>
    p?.startsWith(`/${locale}`) ? p.slice(locale.length + 1) || "/" : p;
  const lhref = (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;

  const [user, setUser] = React.useState({
    name: "Michael Robinson",
    email: "michael.robin@gmail.com",
    avatarUrl: "/placeholder.svg",
  });

  const [openAccount, setOpenAccount] = React.useState(false);
  const [openChangePwd, setOpenChangePwd] = React.useState(false);

  return (
    <div className={cn("h-full flex flex-col bg-white transition-all duration-300", collapsed ? "w-[72px]" : "w-[280px]")}>
      {/* Brand */}
      <div className={cn("mx-3 mt-3 mb-4", !collapsed && "p-3 bg-white border border-gray-200 rounded-2xl")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-full bg-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-[17px] leading-none">Synapse</span>
              </div>
            )}
          </div>
          {toggleCollapsed && !collapsed && (
            <button onClick={toggleCollapsed} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Toggle sidebar">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {collapsed && toggleCollapsed && (
        <div className="px-2 mb-2">
          <button onClick={toggleCollapsed} className="w-full p-2 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center justify-center" aria-label="Toggle sidebar">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            href={lhref(item.href)}
            label={t(item.key)}
            collapsed={collapsed}
            active={isActive(trimLocale(pathname), item)}
          />
        ))}

        <div className="pt-3" />
        <div className="h-px bg-gray-200 mx-1" />
        <div className="pt-2" />

        {NAV_FOOTER.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            href={lhref(item.href)}
            label={t(item.key)}
            collapsed={collapsed}
            active={isActive(trimLocale(pathname), item)}
          />
        ))}
      </nav>

      {/* User card + Dropdown */}
      <div className={cn("border-t border-gray-200", collapsed && "border-0")}>
        <div className={cn("p-3 flex items-center gap-3", collapsed ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center gap-3", collapsed && "hidden")}>
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <Image alt="avatar" src={user.avatarUrl} fill sizes="40px" />
            </div>
            <div className="leading-tight">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>

          {collapsed && (
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200">
              <Image alt="avatar" src={user.avatarUrl} fill sizes="36px" />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("p-2 rounded-lg hover:bg-gray-100 text-gray-600", collapsed && "hidden")} aria-label="More" title="More">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="w-52">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOpenAccount(true)}>
                <UserRound className="w-4 h-4 mr-2" /> My Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenChangePwd(true)}>
                <KeyRound className="w-4 h-4 mr-2" /> Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onClick={() => alert("Sign Out")}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* My Account Modal */}
      <MyAccountModal
        open={openAccount}
        onOpenChange={setOpenAccount}
        user={user}
        onSave={(newName) => {
          // TODO: call API update profile
          setUser((u) => ({ ...u, name: newName }));
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={openChangePwd}
        onOpenChange={setOpenChangePwd}
        onSubmit={(data) => {
          // TODO: integrate API change password here
          console.log("Change password:", data);
        }}
      />
    </div>
  );
}

function isActive(trimmedPath: string, item: { href: string; match?: "exact" | "startsWith" }) {
  if (item.match === "exact") return trimmedPath === item.href;
  return trimmedPath.startsWith(item.href);
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  active = false,
  collapsed = false,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center text-left rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
        active ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("shrink-0 w-5 h-5", active && "text-gray-900")} />
      {!collapsed && <span className="text-[14px] font-medium">{label}</span>}
    </Link>
  );
}

function safeUseLocale(): string | undefined {
  try {
    return useLocale();
  } catch {
    return undefined;
  }
}
function safeUseTranslations(ns?: string) {
  try {
    return useTranslations(ns);
  } catch {
    return (k: string) => k;
  }
}
