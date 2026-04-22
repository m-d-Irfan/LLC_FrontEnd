"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { ModalOverlay } from "./AddModuleModal";
import apiClient from "@/lib/axios";
import { extractError } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Course } from "@/types";

interface Props {
  course: Course;
  onClose: () => void;
  onSuccess: (updated: Partial<Course>) => void;
}

export default function EditCourseModal({ course, onClose, onSuccess }: Props) {
  const [title,        setTitle]        = useState(course.title);
  const [description,  setDescription]  = useState(course.description);
  const [price,        setPrice]        = useState(String(course.price ?? "0"));
  const [isPublished,  setIsPublished]  = useState(course.is_published ?? false);
  const [thumbFile,    setThumbFile]    = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(course.thumbnail ?? null);
  const [saving,       setSaving]       = useState(false);

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setThumbFile(file);
    if (file) setThumbPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title",        title.trim());
      formData.append("description",  description.trim());
      formData.append("price",        price);
      formData.append("is_published", String(isPublished));
      if (thumbFile) formData.append("thumbnail", thumbFile);

      const res = await apiClient.patch(`/api/course/${course.id}/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Course updated!");
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sora font-bold text-lg text-slate-900">Edit Course</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Thumbnail preview + upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 font-dm">Thumbnail</label>
            {thumbPreview && (
              <img
                src={thumbPreview}
                alt="thumbnail preview"
                className="w-full h-36 object-cover rounded-xl mb-2"
              />
            )}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50 cursor-pointer transition-all text-sm font-dm text-slate-500 hover:text-brand-600">
              <Upload className="w-4 h-4" />
              {thumbFile ? thumbFile.name : "Upload new thumbnail"}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbChange}
                className="hidden"
              />
            </label>
          </div>

          <Input
            label="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Machine Learning"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <Input
            label="Price (৳) — set 0 for free"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
            <input
              type="checkbox"
              id="edit-published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-500"
            />
            <label htmlFor="edit-published" className="text-sm font-dm font-semibold text-slate-700 cursor-pointer">
              Published — visible to students on catalog
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}