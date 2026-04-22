"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import AddModuleModal from "@/components/instructor/AddModuleModal";
import AddLessonModal from "@/components/instructor/AddLessonModal";
import EditCourseModal from "@/components/instructor/EditCourseModal";
import EditModuleModal from "@/components/instructor/EditModuleModal";
import EditLessonModal from "@/components/instructor/EditLessonModal";
import { extractError } from "@/lib/utils";
import {
  ArrowLeft, PlusCircle, Layers, FileText, ChevronDown,
  Play, BookOpen, Settings2, Pencil, Trash2, Eye, EyeOff,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Course, Module } from "@/types";
import toast from "react-hot-toast";

export default function ManageCoursePage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();

  const [course,       setCourse]       = useState<Course | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [moduleModal,  setModuleModal]  = useState(false);
  const [lessonModal,  setLessonModal]  = useState(false);
  const [editModal,    setEditModal]    = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [targetModule, setTargetModule] = useState<number | undefined>();
  const [openModules,  setOpenModules]  = useState<Set<number>>(new Set());
  const [editingModule, setEditingModule] = useState<import("@/types").Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<import("@/types").Lesson | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      const res = await courseApi.detail(id);
      setCourse(res.data);
      if (res.data.modules?.length) {
        setOpenModules(new Set([res.data.modules[0].id]));
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const toggleModule = (mId: number) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(mId) ? next.delete(mId) : next.add(mId);
      return next;
    });

  const openAddLesson = (moduleId?: number) => {
    setTargetModule(moduleId);
    setLessonModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await courseApi.delete(id);
      toast.success("Course deleted");
      router.push("/instructor/dashboard");
    } catch (err) {
      toast.error(extractError(err));
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-5 animate-pulse">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-32 rounded-3xl" />
        {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.modules?.reduce((a, m) => a + (m.lessons?.length ?? 0), 0) ?? 0;
  const isPublished  = course.is_published ?? false;

  return (
    <div className="max-w-3xl space-y-7 animate-fade-in">
      {/* Back */}
      <Link
        href="/instructor/dashboard"
        className="inline-flex items-center gap-2 text-sm font-dm text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Course header card */}
      <div className="bg-gradient-to-br from-surface-900 to-surface-800 rounded-3xl overflow-hidden">
        {/* Thumbnail strip */}
        {course.thumbnail && (
          <div className="h-36 relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-900/80" />
          </div>
        )}

        <div className="p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isPublished ? (
                  <Badge variant="teal" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Published
                  </Badge>
                ) : (
                  <Badge variant="slate" className="flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Draft
                  </Badge>
                )}
                <Badge variant="brand">
                  {Number(course.price) === 0 ? "Free" : `৳ ${course.price}`}
                </Badge>
              </div>
              <h1 className="font-sora font-bold text-2xl text-white leading-tight mb-2">
                {course.title}
              </h1>
              <p className="text-sm font-dm text-slate-400 line-clamp-2">
                {course.description}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex gap-6 mt-5 text-sm font-dm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-400" />
              {course.modules?.length ?? 0} modules
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-400" />
              {totalLessons} lessons
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-6 pt-5 border-t border-white/10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditModal(true)}
              className="gap-1.5 bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Details
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteDialog(true)}
              className="gap-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 border-0 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Course
            </Button>
          </div>
        </div>
      </div>

      {/* Modules section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-semibold text-xl text-slate-900">Modules & Lessons</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAddLesson()}
              disabled={!course.modules?.length}
              className="gap-1.5"
            >
              <FileText className="w-4 h-4" /> Add Lesson
            </Button>
            <Button size="sm" onClick={() => setModuleModal(true)} className="gap-1.5">
              <PlusCircle className="w-4 h-4" /> Add Module
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {course.modules?.map((module) => (
            <ModuleBlock
              key={module.id}
              module={module}
              isOpen={openModules.has(module.id)}
              onToggle={() => toggleModule(module.id)}
              onAddLesson={() => openAddLesson(module.id)}
              onEditModule={() => setEditingModule(module)}
              onEditLesson={(lesson) => setEditingLesson(lesson)}
            />
          ))}

          {(!course.modules || course.modules.length === 0) && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Layers className="w-7 h-7 text-slate-300" />
              </div>
              <div>
                <p className="font-sora font-semibold text-slate-600">No modules yet</p>
                <p className="text-sm font-dm text-slate-400 mt-1">
                  Add your first module to start building this course.
                </p>
              </div>
              <Button onClick={() => setModuleModal(true)} size="sm">
                Add First Module
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {moduleModal && (
        <AddModuleModal
          courseId={course.id}
          onClose={() => setModuleModal(false)}
          onSuccess={loadCourse}
        />
      )}
      {lessonModal && course.modules && course.modules.length > 0 && (
        <AddLessonModal
          modules={course.modules}
          defaultModuleId={targetModule}
          onClose={() => setLessonModal(false)}
          onSuccess={loadCourse}
        />
      )}
      {editModal && (
        <EditCourseModal
          course={course}
          onClose={() => setEditModal(false)}
          onSuccess={(updated) => setCourse((c) => ({ ...c!, ...updated }))}
        />
      )}
      {editingModule && (
        <EditModuleModal
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onSuccess={loadCourse}
        />
      )}
      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSuccess={loadCourse}
        />
      )}

      {/* ── Delete confirmation dialog ── */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteDialog(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-lg text-slate-900">Delete this course?</h3>
                <p className="text-sm font-dm text-slate-500 mt-1">
                  This will permanently delete <span className="font-semibold text-slate-700">&ldquo;{course.title}&rdquo;</span> and all its modules, lessons, and enrollments. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteDialog(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  loading={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleBlock({
  module,
  isOpen,
  onToggle,
  onAddLesson,
  onEditModule,
  onEditLesson,
}: {
  module: Module;
  isOpen: boolean;
  onToggle: () => void;
  onAddLesson: () => void;
  onEditModule: () => void;
  onEditLesson: (lesson: import("@/types").Lesson) => void;
}) {
  const lessons = module.lessons ?? [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={onToggle}
      >
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <span className="font-sora font-bold text-sm text-brand-600">{module.order}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sora font-semibold text-slate-800 text-sm">{module.title}</p>
          <p className="text-xs font-dm text-slate-400 mt-0.5">{lessons.length} lessons</p>
        </div>
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onAddLesson}
            className="flex items-center gap-1 text-xs font-dm font-semibold text-brand-500 hover:text-brand-700 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Lesson
          </button>
          <button
            onClick={onEditModule}
            className="flex items-center gap-1 text-xs font-dm font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180")}
        />
      </div>

      {isOpen && (
        <div className="border-t border-slate-100">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-surface-50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                {lesson.video_url
                  ? <Play className="w-3.5 h-3.5 text-brand-400" />
                  : <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-dm text-slate-700 truncate">{lesson.title}</p>
                {lesson.video_url && (
                  <p className="text-xs font-dm text-teal-500 mt-0.5">Has video</p>
                )}
              </div>
              <Badge variant="slate" className="text-xs flex-shrink-0">
                #{lesson.order}
              </Badge>
              <button
                onClick={() => onEditLesson(lesson)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0"
                title="Edit lesson"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ))}

          <div className="px-5 py-3 border-t border-dashed border-slate-200">
            <button
              onClick={onAddLesson}
              className="flex items-center gap-2 text-sm font-dm text-slate-400 hover:text-brand-600 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add lesson to this module
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
