"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { CheckCircle2, XCircle, Clock, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, extractError } from "@/lib/utils";
import toast from "react-hot-toast";

interface Instructor {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  instructor_status: "pending" | "approved" | "rejected";
  instructor_rejection_reason: string;
  date_joined: string;
  course_count: number;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending:  "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-lg text-xs font-dm font-semibold capitalize", map[status] || "")}>
      {status}
    </span>
  );
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actioning,   setActioning]   = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<Instructor | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showAll,     setShowAll]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listInstructors();
      setInstructors(res.data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (inst: Instructor) => {
    setActioning(inst.id);
    try {
      await adminApi.approveInstructor(inst.id);
      toast.success(`✅ ${inst.username} approved — email sent`);
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setActioning(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    setActioning(rejectModal.id);
    try {
      await adminApi.rejectInstructor(rejectModal.id, rejectReason);
      toast.success(`❌ ${rejectModal.username} rejected — email sent`);
      setRejectModal(null);
      setRejectReason("");
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setActioning(null);
    }
  };

  const filtered = instructors.filter((i) => filter === "all" || i.instructor_status === filter);
  const pending  = instructors.filter((i) => i.instructor_status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-bold text-2xl text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-400" /> Instructors
          </h1>
          <p className="text-sm font-dm text-slate-400 mt-1">
            {pending.length > 0
              ? `⚠️ ${pending.length} instructor${pending.length > 1 ? "s" : ""} awaiting approval`
              : "No pending approvals"}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-sm font-dm font-medium capitalize border-b-2 transition-colors",
              filter === f
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            {f} {f !== "all" && `(${instructors.filter((i) => i.instructor_status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-slate-800" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-dm text-slate-500">No {filter} instructors</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                {["Instructor", "Email", "Joined", "Courses", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-dm font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-dm font-semibold text-white text-sm">{inst.first_name} {inst.last_name}</p>
                    <p className="text-xs text-slate-500">@{inst.username}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-dm text-slate-400">{inst.email}</td>
                  <td className="px-5 py-4 text-sm font-dm text-slate-400">
                    {new Date(inst.date_joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-sm font-dm text-slate-300">{inst.course_count}</td>
                  <td className="px-5 py-4">{statusBadge(inst.instructor_status)}</td>
                  <td className="px-5 py-4">
                    {inst.instructor_status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(inst)}
                          disabled={actioning === inst.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-dm font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {actioning === inst.id ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => { setRejectModal(inst); setRejectReason(""); }}
                          disabled={actioning === inst.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-dm font-semibold transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                    {inst.instructor_status === "approved" && (
                      <span className="text-xs text-slate-600 font-dm">Active</span>
                    )}
                    {inst.instructor_status === "rejected" && inst.instructor_rejection_reason && (
                      <span className="text-xs text-slate-600 font-dm italic truncate max-w-[140px] block" title={inst.instructor_rejection_reason}>
                        {inst.instructor_rejection_reason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-sora font-bold text-white mb-1">Reject Instructor</h3>
            <p className="text-sm font-dm text-slate-400 mb-4">
              Rejecting <strong className="text-white">@{rejectModal.username}</strong>. They will receive an email notification.
            </p>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-dm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              rows={3}
              placeholder="Optional reason (e.g. 'Please provide more information about your credentials')"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="ghost" onClick={() => setRejectModal(null)} className="flex-1 border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                loading={actioning === rejectModal.id}
                className="flex-1 bg-red-500 hover:bg-red-600 border-0 text-white"
              >
                Reject & Notify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}