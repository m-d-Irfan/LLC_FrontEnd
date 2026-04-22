"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { moduleApi } from "@/lib/api";
import { extractError } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  courseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddModuleModal({ courseId, onClose, onSuccess }: Props) {
  const [title, setTitle]   = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await moduleApi.create({ course: courseId, title: title.trim() });
      toast.success("Module added!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sora font-bold text-lg text-slate-900">Add Module</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="space-y-4">
          <Input
            label="Module Title"
            placeholder="e.g. Introduction to the Course"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Input
            label="Description"
            placeholder="e.g. This course is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Input
            label="Order"
            placeholder="e.g. 1"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={submit} loading={loading} className="flex-1">Add Module</Button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

export function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
