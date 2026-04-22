"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ModalOverlay } from "./AddModuleModal";
import { moduleApi } from "@/lib/api";
import { extractError } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Module } from "@/types";

interface Props {
  module: Module;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModuleModal({ module, onClose, onSuccess }: Props) {
  const [title,   setTitle]   = useState(module.title);
  const [order,   setOrder]   = useState(String(module.order));
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Module title is required"); return; }
    setSaving(true);
    try {
      await moduleApi.update(module.id, {
        title: title.trim(),
        order: parseInt(order) || module.order,
      });
      toast.success("Module updated!");
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
      await moduleApi.delete(module.id);
      toast.success("Module deleted");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractError(err));
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sora font-bold text-lg text-slate-900">Edit Module</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {!confirmDelete ? (
          <div className="space-y-4">
            <Input
              label="Module Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to the Course"
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
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4 text-sm font-dm text-red-700">
              This will permanently delete <strong>&ldquo;{module.title}&rdquo;</strong> and all
              its lessons. This cannot be undone.
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
                Delete Module
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
