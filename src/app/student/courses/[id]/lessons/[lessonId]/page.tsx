"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseApi, progressApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { extractError } from "@/lib/utils";
import { CheckCircle2, Play, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Course, Lesson, LessonProgress } from "@/types";
import toast from "react-hot-toast";

function getYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

export default function LessonViewPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();

  const [course,    setCourse]    = useState<Course | null>(null);
  const [lesson,    setLesson]    = useState<Lesson | null>(null);
  const [progress,  setProgress]  = useState<LessonProgress[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          courseApi.detail(id),
          progressApi.myProgress(),
        ]);
        const c = cRes.data;
        setCourse(c);
        setProgress(pRes.data);

        const found = c.modules
          ?.flatMap((m) => m.lessons ?? [])
          .find((l) => l.id === Number(lessonId));
        setLesson(found ?? null);
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, lessonId]);

  const isCompleted = progress.some(
    (p) => p.lesson === Number(lessonId) && p.completed
  );

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await progressApi.complete(Number(lessonId));
      toast.success("Lesson marked as complete! ✓");
      const pRes = await progressApi.myProgress();
      setProgress(pRes.data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setCompleting(false);
    }
  };

  // Find next lesson
  const allLessons = course?.modules?.flatMap((m) => m.lessons ?? []) ?? [];
  const currentIdx = allLessons.findIndex((l) => l.id === Number(lessonId));
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];

  const embedUrl = lesson?.video_url ? getYouTubeEmbed(lesson.video_url) : null;

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6 animate-pulse">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="font-dm text-slate-400">Lesson not found.</p>
        <Link href={`/student/courses/${id}`} className="text-brand-500 hover:underline text-sm mt-2 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-7 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-dm text-slate-500 flex-wrap">
        <Link href="/student/courses" className="hover:text-brand-600 transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/student/courses/${id}`} className="hover:text-brand-600 transition-colors line-clamp-1 max-w-[160px]">
          {course?.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 truncate max-w-[160px]">{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div>
        <h1 className="font-sora font-bold text-2xl lg:text-3xl text-slate-900 leading-tight">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-dm font-semibold text-teal-600">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          ) : (
            <span className="text-sm font-dm text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> In Progress
            </span>
          )}
          <span className="text-slate-300">·</span>
          <span className="text-sm font-dm text-slate-400">
            Lesson {currentIdx + 1} of {allLessons.length}
          </span>
        </div>
      </div>

      {/* Video */}
      {lesson.video_url && (
        <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-xl">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-dm text-brand-400 hover:underline"
              >
                Open video ↗
              </a>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <h2 className="font-sora font-semibold text-lg text-slate-800 mb-4">Lesson Content</h2>
        <div className="prose prose-slate max-w-none font-dm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {lesson.content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {/* Nav */}
        <div className="flex items-center gap-3">
          {prevLesson && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/student/courses/${id}/lessons/${prevLesson.id}`)}
            >
              ← Previous
            </Button>
          )}
          {nextLesson && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/student/courses/${id}/lessons/${nextLesson.id}`)}
            >
              Next →
            </Button>
          )}
        </div>

        {/* Complete */}
        {!isCompleted ? (
          <Button
            onClick={handleComplete}
            loading={completing}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Complete
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-teal-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-dm font-semibold">Well done!</span>
          </div>
        )}
      </div>
    </div>
  );
}
