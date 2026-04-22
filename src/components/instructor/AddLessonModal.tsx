"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { lessonApi } from "@/lib/api";
import { extractError } from "@/lib/utils";
import { ModalOverlay } from "./AddModuleModal";
import toast from "react-hot-toast";
import type { Module } from "@/types";

interface Props {
  modules: Module[];
  defaultModuleId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLessonModal({ modules, defaultModuleId, onClose, onSuccess }: Props) {
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState("");
  const [moduleId, setModuleId] = useState<number>(defaultModuleId ?? modules[0]?.id ?? 0);
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    setLoading(true);
    try {
      await lessonApi.create({
        module: moduleId,
        title: title.trim(),
        content: content.trim(),
        video_url: videoUrl.trim() || undefined,
      });
      toast.success("Lesson added!");
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
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sora font-bold text-lg text-slate-900">Add Lesson</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Module selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 font-dm">Module</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-dm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <Input
            label="Lesson Title"
            placeholder="e.g. What is Machine Learning?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Content"
            placeholder="Lesson content / description..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />

          <Input
            label="Video URL (optional)"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
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
            <Button onClick={submit} loading={loading} className="flex-1">Add Lesson</Button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
