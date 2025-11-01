"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Eye, FolderKanban, FileText, Settings, Heart,
  MoreHorizontal, ChevronLeft, ChevronRight,
  UserRound, KeyRound, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import MyAccountModal from "./sidebar-account-modal";
import ChangePasswordModal from "./sidebar-changepassword-modal";
import { UsersApi } from "@/lib/api/user";
import { ChangePasswordRequest, UpdateProfileRequest, UserInfoResponse } from "@/types/interfaces/user";
import { clearTokens } from "@/lib/utils/cookies";


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
  const router = useRouter();
  const pathname = usePathname();
  const intlLocale = safeUseLocale();
  const locale = intlLocale ?? (useParams() as any)?.locale ?? "en";
  const t = safeUseTranslations("nav");

  const [user, setUser] = useState<UserInfoResponse | null>(null);

  const [openAccount, setOpenAccount] = useState(false);
  const [openChangePwd, setOpenChangePwd] = useState(false);

  const trimLocale = (p: string) =>
    p?.startsWith(`/${locale}`) ? p.slice(locale.length + 1) || "/" : p;
  const lhref = (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;

  const handleSaveChangeProfile = async (updatedData: UpdateProfileRequest) => {
    // UsersApi.updatedProfile(updatedData)
    //   .then((response) => {
    //     if (response) {
    //       // Update successful, you might want to update the user state in parent component
    //       setUser((prev) => (prev ? { ...prev, ...response } : null));
    //     }
    //   }) 
    //   .catch((error) => {
    //     console.error("Failed to update profile:", error);
    //   });

    // equal to this code
    try {
      const response = await UsersApi.updatedProfile(updatedData);
      if (response) {
        // Update successful, you might want to update the user state in parent component
        setUser((prev) => (prev ? { ...prev, ...response } : null));
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const handleChangePassword = async (payload: ChangePasswordRequest) => {
    // UsersApi.changePassword(payload)
    //   .then((response) => {
    //     if (response) {
    //       console.log("Password changed successfully");
    //       // Show success message to the user
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Failed to change password:", error);
    //   });

    try {
      const response = await UsersApi.changePassword(payload);
      if (response) {
        // show success message/toast
      }
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  }

  const handleSignOut = () => {
    clearTokens();
    router.push(lhref("/auth/sign-in"));
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await UsersApi.me();
        if (response) setUser(response);
        else setUser(null);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className={cn("h-full flex flex-col bg-white transition-all duration-300", collapsed ? "w-[72px]" : "w-[280px]")}>
        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

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
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 font-semibold">
              {(user.name?.trim()?.[0] || user.email?.trim()?.[0] || "U").toUpperCase()}
            </div>
            <div className="leading-tight">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>

          {collapsed && (
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
              {(user.name?.trim()?.[0] || user.email?.trim()?.[0] || "U").toUpperCase()}
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
                onClick={handleSignOut}
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
        onSave={handleSaveChangeProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={openChangePwd}
        onOpenChange={setOpenChangePwd}
        onSubmit={handleChangePassword}
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
