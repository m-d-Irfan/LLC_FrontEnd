"use client";

import { useEffect, useState } from "react";
import { courseApi, enrollmentApi } from "@/lib/api";
import CourseCard from "@/components/courses/CourseCard";
import { PageSkeleton } from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";
import { Search, BookOpen } from "lucide-react";
import { extractError } from "@/lib/utils";
import type { Course, Enrollment } from "@/types";
import toast from "react-hot-toast";

export default function CourseCatalogPage() {
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [query,       setQuery]       = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          courseApi.list(),
          enrollmentApi.myEnrollments(),
        ]);
        setCourses(cRes.data);
        setEnrollments(eRes.data);
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const enrolledIds = new Set(enrollments.map((e) => e.course.id));

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-sora font-bold text-3xl text-slate-900">Course Catalog</h1>
        <p className="font-dm text-slate-500 mt-1">{courses.length} courses available</p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search courses…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        icon={<Search className="w-4 h-4" />}
        className="max-w-md"
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-slate-400" />
          </div>
          <p className="font-sora font-semibold text-slate-700">No courses found</p>
          <p className="text-sm font-dm text-slate-500">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/student/courses/${course.id}`}
              enrolled={enrolledIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
