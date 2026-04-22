"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Users, Trash2, Search, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, extractError } from "@/lib/utils";
import toast from "react-hot-toast";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_instructor: boolean;
  is_student: boolean;
  is_staff: boolean;
  instructor_status: string;
  date_joined: string;
  course_count: number;
}

export default function AdminUsersPage() {
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [deleteModal,  setDeleteModal]  = useState<AdminUser | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting,     setDeleting]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers();
      setUsers(res.data);
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
      await adminApi.deleteUser(deleteModal.id, deleteReason);
      toast.success(`User @${deleteModal.username} deleted and notified`);
      setDeleteModal(null);
      setDeleteReason("");
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (u: AdminUser) => {
    if (u.is_staff) return <span className="px-2 py-0.5 rounded-lg text-xs font-dm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Admin</span>;
    if (u.is_instructor) return <span className={cn("px-2 py-0.5 rounded-lg text-xs font-dm font-semibold border", u.instructor_status === "approved" ? "bg-teal-500/20 text-teal-400 border-teal-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30")}>Instructor {u.instructor_status !== "approved" ? `(${u.instructor_status})` : ""}</span>;
    return <span className="px-2 py-0.5 rounded-lg text-xs font-dm font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">Student</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-sora font-bold text-2xl text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" /> Users
          </h1>
          <p className="text-sm font-dm text-slate-400 mt-1">{users.length} total users</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-dm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-60"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-slate-800" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-dm text-slate-500">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-dm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-dm font-semibold text-white text-sm">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-slate-500">@{u.username}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-dm text-slate-400">{u.email}</td>
                  <td className="px-5 py-3.5">{roleBadge(u)}</td>
                  <td className="px-5 py-3.5 text-sm font-dm text-slate-400">
                    {new Date(u.date_joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    {!u.is_staff ? (
                      <button
                        onClick={() => { setDeleteModal(u); setDeleteReason(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-dm font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-purple-400 font-dm">
                        <ShieldCheck className="w-3.5 h-3.5" /> Protected
                      </span>
                    )}
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
            <h3 className="font-sora font-bold text-white mb-1">Delete User</h3>
            <p className="text-sm font-dm text-slate-400 mb-4">
              This will permanently delete <strong className="text-white">@{deleteModal.username}</strong> and all their data. They will receive an email notification.
            </p>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-dm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              rows={3}
              placeholder="Optional reason to include in the notification email…"
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