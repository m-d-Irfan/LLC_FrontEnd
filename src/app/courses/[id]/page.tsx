"use client";

import PublicNav from "@/components/layout/PublicNav";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { courseApi, enrollmentApi, progressApi } from "@/lib/api";
import { cn, extractError } from "@/lib/utils";
import type { Course, Enrollment, LessonProgress, Module } from "@/types";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Lock,
    LogIn,
    Play,
    Settings2,
    Tag,
    User,
    UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PublicCourseDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();
  const router   = useRouter();

  const [course,     setCourse]     = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress,   setProgress]   = useState<LessonProgress[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [enrolling,  setEnrolling]  = useState(false);
  const [openMods,   setOpenMods]   = useState<Set<number>>(new Set());

  const loadData = async () => {
    try {
      const cRes = await courseApi.detail(id);
      setCourse(cRes.data);
      if (cRes.data.modules?.length) {
        setOpenMods(new Set([cRes.data.modules[0].id]));
      }
      if (user?.is_student) {
        const [eRes, pRes] = await Promise.all([
          enrollmentApi.myEnrollments(),
          progressApi.myProgress(),
        ]);
        setEnrollment(eRes.data.find((e) => e.course.id === Number(id)) ?? null);
        setProgress(pRes.data);
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { router.push("/register"); return; }

    // Free course — enroll directly
    if (!isFree) {
      router.push(`/payment/${id}`);
      return;
    }
    setEnrolling(true);
    try {
      await enrollmentApi.enroll(Number(id));
      toast.success("Enrolled successfully! 🎉");
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
    ? Math.round((allLessons.filter((l) => completedIds.has(l.id)).length / allLessons.length) * 100)
    : 0;

  // A course is free only when price is explicitly 0
  const isFree = Number(course?.price ?? 1) === 0;
  

  const toggleMod = (mId: number) =>
    setOpenMods((prev) => {
      const next = new Set(prev);
      next.has(mId) ? next.delete(mId) : next.add(mId);
      return next;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 space-y-6 animate-pulse">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-56 rounded-3xl" />
          <div className="space-y-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-surface-50">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm font-dm text-slate-500 hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: course info ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <div className="bg-surface-900 rounded-3xl p-8 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="teal">{isFree ? "Free Course" : `৳ ${course.price}`}</Badge>
                <Badge variant="brand">{course.modules?.length ?? 0} Modules</Badge>
                <Badge variant="slate">{allLessons.length} Lessons</Badge>
              </div>
              <h1 className="font-sora font-bold text-3xl text-white leading-tight mb-3">
                {course.title}
              </h1>
              <p className="font-dm text-slate-300 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap gap-5 mt-6 text-sm font-dm text-slate-400">
                {course.created_by && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand-400" />
                    {course.created_by}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  {new Date(course.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </span>
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="font-sora font-semibold text-xl text-slate-900 mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {course.modules?.map((module, idx) => (
                  <PublicModuleAccordion
                    key={module.id}
                    module={module}
                    isOpen={openMods.has(module.id)}
                    onToggle={() => toggleMod(module.id)}
                    isEnrolled={!!enrollment}
                    completedIds={completedIds}
                    courseId={course.id}
                  />
                ))}
                {(!course.modules || course.modules.length === 0) && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                    <p className="font-dm text-slate-400">Curriculum being prepared — check back soon!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: sticky CTA card ──────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Price banner */}
              <div className="bg-gradient-to-br from-brand-500 to-teal-500 px-6 py-5 text-white text-center">
                <div className="flex items-center justify-center gap-2">
                  <Tag className="w-5 h-5" />
                  <span className="font-sora font-bold text-2xl">
                    {isFree ? "Free" : `৳ ${course.price}`}
                  </span>
                </div>
                {!isFree && <p className="text-brand-100 text-xs font-dm mt-1">One-time payment · Lifetime access</p>}
              </div>

              <div className="p-6 space-y-4">
                {/* ── Guest: not logged in ── */}
                {!user && (
                  <>
                    <p className="text-sm font-dm text-slate-500 text-center">
                      Join EduCore AI to enroll in this course
                    </p>
                    <Link href={`/register`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-dm font-semibold text-sm transition-all shadow-lg shadow-brand-500/25">
                      <UserPlus className="w-4 h-4" /> Create Free Account
                    </Link>
                    <Link href="/login"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-brand-300 text-slate-700 font-dm font-semibold text-sm transition-all">
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                  </>
                )}

                {/* ── Instructor: viewing their own course ── */}
                {user?.is_instructor && (
                  <>
                    <p className="text-sm font-dm text-slate-500 text-center">You created this course</p>
                    <Link href={`/instructor/courses/${course.id}/manage`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-dm font-semibold text-sm transition-all shadow-lg shadow-brand-500/25">
                      <Settings2 className="w-4 h-4" /> Manage Course
                    </Link>
                  </>
                )}

                {/* ── Student: not enrolled ── */}
                {user?.is_student && !enrollment && (
                  <>
                    {isFree ? (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-dm font-semibold text-sm transition-all shadow-lg shadow-brand-500/25"
                      >
                        {enrolling ? "Enrolling…" : "Enroll for Free"}
                      </button>
                    ) : (
                      <>
                        <button
                          // disabled
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-dm font-semibold text-sm transition-all shadow-lg shadow-brand-500/25 "
                        >
                          Pay & Enroll — ৳ {course.price}
                        </button>
                        {/* <p className="text-xs font-dm text-slate-400 text-center">
                          💳 Payment system coming soon
                        </p> */}
                      </>
                    )}
                  </>
                )}

                {/* ── Student: already enrolled ── */}
                {user?.is_student && enrollment && (
                  <>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-between text-sm font-dm text-slate-600">
                        <span>Your progress</span>
                        <span className="font-bold text-brand-600">{progressPct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-400 to-teal-400 rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/student/courses/${course.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-dm font-semibold text-sm transition-all shadow-lg shadow-teal-500/25">
                      <Play className="w-4 h-4" />
                      {progressPct > 0 ? "Continue Learning" : "Start Course"}
                    </Link>
                  </>
                )}

                {/* What's included */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <p className="text-xs font-sora font-bold text-slate-500 uppercase tracking-wide">What's included</p>
                  {[
                    `${allLessons.length} on-demand lessons`,
                    `${course.modules?.length ?? 0} structured modules`,
                    "Certificate of completion",
                    "AI Tutor support",
                    "Lifetime access",
                    "Community access",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-dm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Module accordion for public page ───────────────────────── */
function PublicModuleAccordion({ module, isOpen, onToggle, isEnrolled, completedIds, courseId }: {
  module: Module; isOpen: boolean; onToggle: () => void;
  isEnrolled: boolean; completedIds: Set<number>; courseId: number;
}) {
  const lessons = module.lessons ?? [];
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <span className="font-sora font-bold text-sm text-brand-600">{module.order}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sora font-semibold text-slate-800 text-sm">{module.title}</p>
          <p className="text-xs font-dm text-slate-400 mt-0.5">
            {isEnrolled ? `${completedCount}/${lessons.length}` : lessons.length} lessons
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {lessons.map((lesson) => (
            isEnrolled ? (
              <Link key={lesson.id}
                href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-brand-50 transition-colors group">
                {completedIds.has(lesson.id)
                  ? <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-brand-400 transition-colors flex-shrink-0" />}
                <span className={cn("text-sm font-dm flex-1",
                  completedIds.has(lesson.id) ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-brand-700")}>
                  {lesson.title}
                </span>
                {lesson.video_url && <Play className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />}
              </Link>
            ) : (
              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5">
                <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="text-sm font-dm text-slate-500 flex-1">{lesson.title}</span>
                {lesson.video_url && <Play className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}