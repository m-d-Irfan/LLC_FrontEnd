"use client";

import Badge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Course } from "@/types";
import { BookOpen, Clock, User } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
  href: string;
  enrolled?: boolean;
  progress?: number;
}

// Deterministic gradient from course id
const GRADIENTS = [
  "from-brand-400 to-teal-400",
  "from-violet-400 to-brand-400",
  "from-teal-400 to-cyan-400",
  "from-rose-400 to-pink-400",
  "from-amber-400 to-orange-400",
  "from-emerald-400 to-teal-400",
];

export default function CourseCard({ course, href, enrolled, progress }: CourseCardProps) {
  const gradient = GRADIENTS[course.id % GRADIENTS.length];
  const moduleCount = course.modules?.length ?? 0;
  const lessonCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  return (
    <Link href={href}>
      <Card hover className="overflow-hidden h-full flex flex-col">
        {/* Thumbnail or fallback gradient */}
        <div className={`h-40 relative flex items-end p-5 ${course.thumbnail ? "" : `bg-gradient-to-br ${gradient}`}`}>
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="relative z-10 flex items-center gap-2">
            {enrolled && <Badge variant="green">✓ Enrolled</Badge>}
            {Number(course.price) === 0
              ? <Badge variant="teal">Free</Badge>
              : <Badge variant="brand">৳ {course.price}</Badge>
            }
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="font-sora font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-1">
              {course.title}
            </h3>
            <p className="text-sm font-dm text-slate-500 line-clamp-2">{course.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-dm text-slate-500 mt-auto pt-2">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              {moduleCount} modules
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              {lessonCount} lessons
            </span>
          </div>

          {/* Progress bar */}
          {enrolled && typeof progress === "number" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-dm text-slate-500">
                <span>Progress</span>
                <span className="text-brand-600 font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-400 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {course.created_by && (
            <div className="flex items-center gap-1.5 text-xs font-dm text-slate-400 border-t border-slate-100 pt-3">
              <User className="w-3.5 h-3.5" />
              <span>{course.created_by}</span>
              <span className="ml-auto">{formatDate(course.created_at)}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
