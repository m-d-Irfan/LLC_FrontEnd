"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Play, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module, Lesson } from "@/types";

interface ModuleAccordionProps {
  module: Module;
  courseId: number;
  completedLessonIds: Set<number>;
  isEnrolled: boolean;
  defaultOpen?: boolean;
}

export default function ModuleAccordion({
  module,
  courseId,
  completedLessonIds,
  isEnrolled,
  defaultOpen = false,
}: ModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const lessons = module.lessons ?? [];
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* Module header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-surface-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold font-sora text-brand-600">{module.order}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sora font-semibold text-slate-800 text-sm">{module.title}</p>
          <p className="text-xs font-dm text-slate-400 mt-0.5">
            {completedCount}/{lessons.length} lessons complete
          </p>
        </div>
        {/* Mini progress */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-teal-400 rounded-full transition-all"
              style={{ width: lessons.length ? `${(completedCount / lessons.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0", open && "rotate-180")}
        />
      </button>

      {/* Lessons */}
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              completed={completedLessonIds.has(lesson.id)}
              isEnrolled={isEnrolled}
            />
          ))}
          {lessons.length === 0 && (
            <p className="px-5 py-4 text-sm font-dm text-slate-400">No lessons yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LessonRow({
  lesson,
  courseId,
  completed,
  isEnrolled,
}: {
  lesson: Lesson;
  courseId: number;
  completed: boolean;
  isEnrolled: boolean;
}) {
  if (!isEnrolled) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white opacity-60">
        <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
        <span className="text-sm font-dm text-slate-500">{lesson.title}</span>
        {lesson.video_url && (
          <span className="ml-auto text-xs text-slate-400 font-dm">Video</span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/student/courses/${courseId}/lessons/${lesson.id}`}
      className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-brand-50 transition-colors group"
    >
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-brand-400 transition-colors flex-shrink-0" />
      )}
      <span
        className={cn(
          "text-sm font-dm",
          completed ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-brand-700"
        )}
      >
        {lesson.title}
      </span>
      {lesson.video_url && (
        <span className="ml-auto flex items-center gap-1 text-xs text-brand-400 font-dm">
          <Play className="w-3 h-3" /> Video
        </span>
      )}
    </Link>
  );
}
