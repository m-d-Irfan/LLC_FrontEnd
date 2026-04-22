"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { enrollmentApi, progressApi } from "@/lib/api";
import CourseCard from "@/components/courses/CourseCard";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { BookOpen, Trophy, Target, Flame } from "lucide-react";
import { extractError } from "@/lib/utils";
import type { Enrollment, LessonProgress } from "@/types";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress,    setProgress]    = useState<LessonProgress[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [eRes, pRes] = await Promise.all([
          enrollmentApi.myEnrollments(),
          progressApi.myProgress(),
        ]);
        setEnrollments(eRes.data);
        setProgress(pRes.data);
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson)
  );

  // Calculate per-course progress
  const courseProgress = (enrollment: Enrollment) => {
    const course = enrollment.course;
    const allLessons =
      course.modules?.flatMap((m) => m.lessons ?? []) ?? [];
    if (!allLessons.length) return 0;
    const done = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
    return (done / allLessons.length) * 100;
  };

  const completedCourses = enrollments.filter((e) => courseProgress(e) === 100).length;
  const totalLessons = progress.filter((p) => p.completed).length;

  const firstName = user?.first_name || user?.username || "Learner";

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-sm font-dm text-slate-500 font-medium">Welcome back 👋</p>
        <h1 className="font-sora font-bold text-3xl text-slate-900 mt-1">
          {firstName}&apos;s Dashboard
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: enrollments.length, icon: <BookOpen className="w-5 h-5" />, color: "brand" },
          { label: "Completed",        value: completedCourses,   icon: <Trophy className="w-5 h-5" />,   color: "teal" },
          { label: "Lessons Done",     value: totalLessons,       icon: <Target className="w-5 h-5" />,   color: "brand" },
          { label: "Day Streak",       value: "—",                icon: <Flame className="w-5 h-5" />,    color: "teal" },
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

      {/* Enrolled courses */}
      <div>
        <h2 className="font-sora font-semibold text-xl text-slate-900 mb-5">My Courses</h2>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-brand-400" />
            </div>
            <div>
              <p className="font-sora font-semibold text-slate-800">No courses yet</p>
              <p className="text-sm font-dm text-slate-500 mt-1">
                Browse the catalog and enroll in your first course.
              </p>
            </div>
            <a
              href="/student/courses"
              className="mt-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-dm font-semibold hover:bg-brand-600 transition-colors"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                course={enrollment.course}
                href={`/student/courses/${enrollment.course.id}`}
                enrolled
                progress={courseProgress(enrollment)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
