import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700 font-dm">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5",
          "text-sm font-dm text-slate-900 placeholder:text-slate-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
          "transition-all duration-200 min-h-[100px]",
          error && "border-red-400 focus:ring-red-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-dm">{error}</p>}
    </div>
  );
}
