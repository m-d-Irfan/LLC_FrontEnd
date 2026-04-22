"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Users, GraduationCap, BookOpen, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import { extractError } from "@/lib/utils";

interface Stats {
  total_users: number;
  total_students: number;
  total_instructors: number;
  pending_instructors: number;
  total_courses: number;
  published_courses: number;
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then((r) => setStats(r.data))
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    {
      label: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "from-brand-500 to-brand-600",
      sub: `${stats.total_students} students · ${stats.total_instructors} instructors`,
    },
    {
      label: "Pending Approvals",
      value: stats.pending_instructors,
      icon: Clock,
      color: stats.pending_instructors > 0 ? "from-amber-500 to-orange-500" : "from-slate-600 to-slate-700",
      sub: "Instructors awaiting review",
      urgent: stats.pending_instructors > 0,
      href: "/admin-panel/instructors",
    },
    {
      label: "Total Courses",
      value: stats.total_courses,
      icon: BookOpen,
      color: "from-teal-500 to-teal-600",
      sub: `${stats.published_courses} published`,
    },
    {
      label: "Approved Instructors",
      value: stats.total_instructors - stats.pending_instructors,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      sub: "Active instructors",
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sora font-bold text-2xl text-white">Admin Dashboard</h1>
        <p className="text-sm font-dm text-slate-400 mt-1">Platform overview and quick actions</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl bg-slate-800" />
            ))
          : cards.map((card) => {
              const Icon = card.icon;
              const inner = (
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-5 text-white h-full`}>
                  {card.urgent && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  )}
                  <Icon className="w-6 h-6 opacity-80 mb-3" />
                  <p className="font-sora font-bold text-3xl">{card.value}</p>
                  <p className="font-sora font-semibold text-sm mt-0.5 opacity-90">{card.label}</p>
                  <p className="text-xs font-dm opacity-60 mt-1">{card.sub}</p>
                </div>
              );
              return card.href ? (
                <Link key={card.label} href={card.href} className="block hover:scale-[1.02] transition-transform">
                  {inner}
                </Link>
              ) : (
                <div key={card.label}>{inner}</div>
              );
            })
        }
      </div>

      {/* Quick links */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="font-sora font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/admin-panel/instructors", label: "Review Pending Instructors", icon: GraduationCap, color: "text-amber-400" },
            { href: "/admin-panel/users",       label: "Manage Users",               icon: Users,         color: "text-brand-400" },
            { href: "/admin-panel/courses",     label: "Manage Courses",             icon: BookOpen,      color: "text-teal-400" },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
              <span className="text-sm font-dm text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}