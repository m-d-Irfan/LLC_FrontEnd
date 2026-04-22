"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { ModalOverlay } from "./AddModuleModal";
import { lessonApi } from "@/lib/api";
import { extractError } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Lesson } from "@/types";

interface Props {
  lesson: Lesson;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLessonModal({ lesson, onClose, onSuccess }: Props) {
  const [title,    setTitle]    = useState(lesson.title);
  const [content,  setContent]  = useState(lesson.content ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson.video_url ?? "");
  const [order,    setOrder]    = useState(String(lesson.order));
  const [saving,   setSaving]   = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!title.trim())   { toast.error("Lesson title is required");   return; }
    if (!content.trim()) { toast.error("Lesson content is required"); return; }
    setSaving(true);
    try {
      await lessonApi.update(lesson.id, {
        title:     title.trim(),
        content:   content.trim(),
        video_url: videoUrl.trim() || null,
        order:     parseInt(order) || lesson.order,
      });
      toast.success("Lesson updated!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await lessonApi.delete(lesson.id);
      toast.success("Lesson deleted");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractError(err));
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-sora font-bold text-lg text-slate-900">Edit Lesson</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {!confirmDelete ? (
          <div className="p-6 space-y-4">
            <Input
              label="Lesson Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. What is Machine Learning?"
            />
            <Textarea
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Lesson content / description..."
            />
            <Input
              label="Video URL (optional)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <Input
              label="Order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="text-red-500 hover:bg-red-50 border-red-200"
              >
                Delete
              </Button>
              <div className="flex gap-2 ml-auto">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} loading={saving}>Save</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="bg-red-50 rounded-xl p-4 text-sm font-dm text-red-700">
              This will permanently delete the lesson <strong>&ldquo;{lesson.title}&rdquo;</strong>.
              Student progress on this lesson will also be removed. This cannot be undone.
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                loading={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
              >
                Delete Lesson
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
