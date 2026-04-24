"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  LogOut, Sparkles, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin-panel/dashboard",   label: "Dashboard",   icon: LayoutDashboard, exact: true },
  { href: "/admin-panel/instructors", label: "Instructors", icon: GraduationCap },
  { href: "/admin-panel/users",       label: "Users",       icon: Users },
  { href: "/admin-panel/courses",     label: "Courses",     icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-sora font-bold text-white text-sm leading-tight">EduCore AI</p>
            <p className="text-xs font-dm text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dm font-medium transition-all",
                  active
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <p className="text-xs font-dm font-semibold text-white truncate">
              {user?.first_name || user?.username}
            </p>
            <p className="text-xs font-dm text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-dm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}