"use client";

import { useEffect, useState } from "react";
import { courseApi, enrollmentApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PublicNav from "@/components/layout/PublicNav";
import CourseCard from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Course, Enrollment } from "@/types";

export default function PublicCoursesPage() {
  const { user } = useAuth();
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [query,       setQuery]       = useState("");

  useEffect(() => {
    const fetches: Promise<void>[] = [
      courseApi.list().then((r) => setCourses(r.data)),
    ];
    if (user?.is_student) {
      fetches.push(enrollmentApi.myEnrollments().then((r) => setEnrollments(r.data)));
    }
    Promise.all(fetches).finally(() => setLoading(false));
  }, [user]);

  const enrolledIds = new Set(enrollments.map((e) => e.course.id));

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <PublicNav />

      {/* Hero banner */}
      <div className="bg-surface-900 pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold font-dm uppercase tracking-widest text-teal-400 mb-2">All Courses</p>
          <h1 className="font-sora font-bold text-4xl sm:text-5xl text-white mb-3">
            Explore Our Courses
          </h1>
          <p className="text-slate-400 font-dm max-w-xl">
            From beginner to expert — find the course that moves your career forward. Some are completely free.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            placeholder="Search courses by name or topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <div className="flex items-center gap-2 text-sm font-dm text-slate-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{filtered.length} courses found</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400 font-dm">
            No courses match your search. Try different keywords.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                href={`/courses/${course.id}`}
                enrolled={enrolledIds.has(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
