import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-xl shadow-brand-400/30 mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="font-sora font-bold text-8xl text-brand-100 select-none">404</p>
        <h1 className="font-sora font-bold text-2xl text-slate-900 mt-2">Page not found</h1>
        <p className="font-dm text-slate-500 mt-3 leading-relaxed">
          Looks like this lesson doesn&apos;t exist — yet. Head back and keep exploring.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-dm font-semibold hover:bg-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
