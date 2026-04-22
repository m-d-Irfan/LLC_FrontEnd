"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  PlusCircle,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard",     icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/student/courses",   label: "Course Catalog", icon: <BookOpen className="w-5 h-5" /> },
];

const instructorNav: NavItem[] = [
  { href: "/instructor/dashboard",     label: "Dashboard",      icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/instructor/courses/create", label: "Create Course",  icon: <PlusCircle className="w-5 h-5" /> },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const nav = user?.is_instructor ? instructorNav : studentNav;
  const roleLabel = user?.is_instructor ? "Instructor" : "Student";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <aside className={cn(
      "flex flex-col h-full",
      "bg-surface-900 text-white w-64",
      mobile ? "w-full" : ""
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-sora font-bold text-base tracking-tight text-white">EduCore</span>
            <span className="font-sora font-bold text-base text-brand-400"> AI</span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold font-sora">
            {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold font-dm text-white truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user?.username}
            </p>
            <div className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-teal-400" />
              <p className="text-xs font-dm text-slate-400">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold font-dm uppercase tracking-widest text-slate-500">
          Navigation
        </p>
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dm font-medium",
                "transition-all duration-150 group",
                active
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              {item.label}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-dm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
