"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/#features", label: "Features" },
  { href: "/#about",    label: "About" },
  { href: "/#contact",  label: "Contact" },
];

export default function PublicNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  const dashboardHref = user?.is_instructor
    ? "/instructor/dashboard"
    : "/student/dashboard";

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-sora font-bold text-slate-900">
              EduCore <span className="text-brand-500">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-dm font-medium transition-colors",
                  pathname === l.href
                    ? "text-brand-600"
                    : "text-slate-600 hover:text-brand-600"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 text-sm font-dm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-dm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-dm font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-dm font-semibold transition-all shadow-md shadow-brand-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-5 pt-3 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-dm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link href={dashboardHref} onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-dm font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-dm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-dm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-dm font-semibold bg-brand-500 text-white text-center hover:bg-brand-600 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
