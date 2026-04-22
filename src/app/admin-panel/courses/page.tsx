"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { BookOpen, Trash2, Search, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, extractError } from "@/lib/utils";
import toast from "react-hot-toast";

interface AdminCourse {
  id: number;
  title: string;
  description: string;
  price: string;
  is_published: boolean;
  created_at: string;
  instructor_name: string;
  instructor_email: string;
  enrollment_count: number;
}

export default function AdminCoursesPage() {
  const [courses,      setCourses]      = useState<AdminCourse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [deleteModal,  setDeleteModal]  = useState<AdminCourse | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting,     setDeleting]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listCourses();
      setCourses(res.data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await adminApi.deleteCourse(deleteModal.id, deleteReason);
      toast.success(`Course "${deleteModal.title}" deleted and instructor notified`);
      setDeleteModal(null);
      setDeleteReason("");
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-sora font-bold text-2xl text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-400" /> Courses
          </h1>
          <p className="text-sm font-dm text-slate-400 mt-1">
            {courses.length} total · {courses.filter((c) => c.is_published).length} published
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-dm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-60"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-slate-800" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-dm text-slate-500">No courses found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                {["Course", "Instructor", "Price", "Students", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-dm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 max-w-[220px]">
                    <p className="font-dm font-semibold text-white text-sm truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{c.description?.slice(0, 60)}…</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-dm text-slate-300">{c.instructor_name}</p>
                    <p className="text-xs text-slate-500">{c.instructor_email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-dm text-slate-300">
                    {Number(c.price) === 0 ? (
                      <span className="text-teal-400 font-semibold">Free</span>
                    ) : (
                      `৳ ${c.price}`
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-dm text-slate-300">{c.enrollment_count}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "flex items-center gap-1 text-xs font-dm font-semibold px-2 py-0.5 rounded-lg w-fit",
                      c.is_published
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-700 text-slate-400 border border-slate-600"
                    )}>
                      {c.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {c.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => { setDeleteModal(c); setDeleteReason(""); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-dm font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-sora font-bold text-white mb-1">Delete Course</h3>
            <p className="text-sm font-dm text-slate-400 mb-4">
              Permanently delete <strong className="text-white">&ldquo;{deleteModal.title}&rdquo;</strong>?
              The instructor <strong className="text-white">{deleteModal.instructor_name}</strong> will be notified by email.
            </p>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-dm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              rows={3}
              placeholder="Optional reason to include in the instructor email…"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="ghost" onClick={() => setDeleteModal(null)} className="flex-1 border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                loading={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 border-0 text-white"
              >
                Delete & Notify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}