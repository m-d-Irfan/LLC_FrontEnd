"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { courseApi } from "@/lib/api";
import apiClient from "@/lib/axios";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { extractError } from "@/lib/utils";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CreateCoursePage() {
  const router = useRouter();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<{ title?: string; description?: string }>({});
  const [price,       setPrice]       = useState("0.00");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim())       e.title       = "Course title is required";
    if (!description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("is_published", String(isPublished));
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const res = await apiClient.post("/api/course/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Course created! 🎉");
      router.push(`/instructor/courses/${res.data.id}/manage`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7 animate-fade-in">
      {/* Back */}
      <Link
        href="/instructor/dashboard"
        className="inline-flex items-center gap-2 text-sm font-dm text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-sora font-bold text-3xl text-slate-900">Create a New Course</h1>
        <p className="font-dm text-slate-500 mt-1">
          Fill in the details below. You can add modules and lessons after creating the course.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-7 pb-6 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="font-sora font-semibold text-slate-900">Course Details</p>
            <p className="text-xs font-dm text-slate-400">Basic info about your course</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Course Title"
            placeholder="e.g. Introduction to Machine Learning"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <Textarea
            label="Description"
            placeholder="What will students learn in this course? What are the prerequisites?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            rows={5}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 font-dm">
              Thumbnail Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-dm text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-600 file:font-dm file:font-semibold hover:file:bg-brand-100 transition-all"
            />
          </div>

          <Input
            label="Price (৳) — leave 0 for free"
            type="number"
            placeholder="0.00"
            min="0"        
            step="0.01"      
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0).toString())}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-500"
            />
            <label htmlFor="published" className="text-sm font-dm font-semibold text-slate-700">
              Publish this course immediately
            </label>
          </div>

          {/* Tips */}
          <div className="bg-brand-50 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-dm text-brand-700 space-y-1">
              <p className="font-semibold">Tips for a great course:</p>
              <ul className="list-disc list-inside space-y-0.5 text-brand-600">
                <li>Write a clear, specific title</li>
                <li>Describe what students will gain</li>
                <li>Mention skill level or prerequisites</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/instructor/dashboard" className="flex-1">
              <Button variant="ghost" type="button" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" loading={loading} className="flex-1">
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
