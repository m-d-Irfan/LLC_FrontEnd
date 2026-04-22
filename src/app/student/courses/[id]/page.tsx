"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { courseApi, enrollmentApi, progressApi } from "@/lib/api";
import ModuleAccordion from "@/components/courses/ModuleAccordion";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { extractError } from "@/lib/utils";
import { BookOpen, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Course, Enrollment, LessonProgress } from "@/types";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [course,      setCourse]      = useState<Course | null>(null);
  const [enrollment,  setEnrollment]  = useState<Enrollment | null>(null);
  const [progress,    setProgress]    = useState<LessonProgress[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [enrolling,   setEnrolling]   = useState(false);

  const loadData = async () => {
    try {
      const [cRes, eRes, pRes] = await Promise.all([
        courseApi.detail(id),
        enrollmentApi.myEnrollments(),
        progressApi.myProgress(),
      ]);
      setCourse(cRes.data);
      setEnrollment(eRes.data.find((e) => e.course.id === Number(id)) ?? null);
      setProgress(pRes.data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollmentApi.enroll(Number(id));
      toast.success("Successfully enrolled! 🎉");
      await loadData();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setEnrolling(false);
    }
  };

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson));
  const allLessons   = course?.modules?.flatMap((m) => m.lessons ?? []) ?? [];
  const progressPct  = allLessons.length
    ? (allLessons.filter((l) => completedIds.has(l.id)).length / allLessons.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-7 animate-fade-in max-w-4xl">
      {/* Back */}
      <Link href="/student/courses" className="inline-flex items-center gap-2 text-sm font-dm text-slate-500 hover:text-brand-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900 rounded-3xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="font-sora font-bold text-3xl lg:text-4xl leading-tight mb-3">{course.title}</h1>
          <p className="font-dm text-slate-300 leading-relaxed text-base">{course.description}</p>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm font-dm text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-400" />
              {course.modules?.length ?? 0} Modules
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              {allLessons.length} Lessons
            </span>
          </div>

          {/* Enrolled progress or enroll button */}
          <div className="mt-6">
            {enrollment ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-dm text-slate-300">Your progress</span>
                  <span className="font-sora font-bold text-teal-400">{Math.round(progressPct)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-brand-400 rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-teal-400 font-dm font-semibold">✓ Enrolled</p>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleEnroll}
                loading={enrolling}
                className="mt-2"
              >
                Enroll Now — It&apos;s Free
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="font-sora font-semibold text-xl text-slate-900 mb-4">Course Content</h2>
        <div className="space-y-3">
          {course.modules?.map((module, idx) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              courseId={course.id}
              completedLessonIds={completedIds}
              isEnrolled={!!enrollment}
              defaultOpen={idx === 0}
            />
          ))}
          {(!course.modules || course.modules.length === 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="font-dm text-slate-400">No modules published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
