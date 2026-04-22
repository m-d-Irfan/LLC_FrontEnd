"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { courseApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { extractError, formatDate } from "@/lib/utils";
import {
  BookOpen, PlusCircle, Layers, FileText, ArrowRight, TrendingUp
} from "lucide-react";
import Link from "next/link";
import type { Course } from "@/types";
import toast from "react-hot-toast";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.mine()
      .then((res) => setCourses(res.data))
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.first_name || user?.username || "Instructor";
  const totalModules = courses.reduce((a, c) => a + (c.modules?.length ?? 0), 0);
  const totalLessons = courses.reduce((a, c) => a + (c.modules?.flatMap((m) => m.lessons ?? []).length ?? 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-dm text-slate-500 font-medium">Instructor Portal</p>
          <h1 className="font-sora font-bold text-3xl text-slate-900 mt-1">
            Hello, {firstName} 👋
          </h1>
        </div>
        <Link href="/instructor/courses/create">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Courses",  value: courses.length,  icon: <BookOpen className="w-5 h-5" />,  color: "brand" },
          { label: "Total Modules",  value: totalModules,    icon: <Layers className="w-5 h-5" />,    color: "teal" },
          { label: "Total Lessons",  value: totalLessons,    icon: <FileText className="w-5 h-5" />,  color: "brand" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              s.color === "brand" ? "bg-brand-50 text-brand-600" : "bg-teal-50 text-teal-600"
            }`}>
              {s.icon}
            </div>
            <div>
              <p className="font-sora font-bold text-2xl text-slate-900">{s.value}</p>
              <p className="text-xs font-dm text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses list */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-sora font-semibold text-xl text-slate-900">Your Courses</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-brand-400" />
            </div>
            <div>
              <p className="font-sora font-semibold text-slate-800">No courses yet</p>
              <p className="text-sm font-dm text-slate-500 mt-1">
                Create your first course and start teaching!
              </p>
            </div>
            <Link href="/instructor/courses/create">
              <Button>Create First Course</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sora font-semibold text-slate-900 truncate">{course.title}</p>
                      <p className="text-sm font-dm text-slate-500 line-clamp-1 mt-0.5">{course.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant="slate">
                    {course.modules?.length ?? 0} modules
                  </Badge>
                  <span className="text-xs font-dm text-slate-400">{formatDate(course.created_at)}</span>
                  <Link href={`/instructor/courses/${course.id}/manage`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      Manage <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
