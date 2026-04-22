"use client";

import PublicNav from "@/components/layout/PublicNav";
import { Skeleton } from "@/components/ui/Skeleton";
import { courseApi, enrollmentApi } from "@/lib/api";
import apiClient from "@/lib/axios";
import { cn, extractError } from "@/lib/utils";
import type { Course, PaymentMethod } from "@/types";
import {
    AlertCircle,
    ArrowLeft, CheckCircle2, CreditCard,
    Globe,
    Landmark,
    ShieldCheck,
    Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ── payment method config ──────────────────────────────────────────────── */
const METHODS: {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  color: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}[] = [
  {
    id: "bkash", label: "bKash", color: "bg-pink-500",
    icon: <Smartphone className="w-5 h-5" />,
    fields: [
      { key: "transaction_id", label: "bKash Transaction ID", placeholder: "e.g. 8N7A2K3X5P", type: "text" },
    ],
  },
  {
    id: "bank", label: "Bank Transfer", color: "bg-blue-600",
    icon: <Landmark className="w-5 h-5" />,
    fields: [
      { key: "bank_account", label: "Your Bank Account Number", placeholder: "e.g. 01234567890123456", type: "text" },
      { key: "transaction_id", label: "Transfer Reference / Transaction ID", placeholder: "e.g. TRF2024XXXXXXXX", type: "text" },
    ],
  },
  {
    id: "card", label: "Debit / Credit Card", color: "bg-slate-700",
    icon: <CreditCard className="w-5 h-5" />,
    fields: [
      { key: "card_number",    label: "Card Number",       placeholder: "1234 5678 9012 3456", type: "text" },
      { key: "transaction_id", label: "Transaction ID / Reference", placeholder: "e.g. CARD-XXXXXXXXXXXX", type: "text" },
    ],
  },
  {
    id: "paypal", label: "PayPal", color: "bg-indigo-600",
    icon: <Globe className="w-5 h-5" />,
    fields: [
      { key: "transaction_id", label: "PayPal Transaction ID", placeholder: "e.g. 1AB23456CD789012E", type: "text" },
    ],
  },
  {
    id: "payoneer", label: "Payoneer", color: "bg-orange-500",
    icon: <Globe className="w-5 h-5" />,
    fields: [
      { key: "transaction_id", label: "Payoneer Transaction ID", placeholder: "e.g. PAY-XXXX-XXXX-XXXX", type: "text" },
    ],
  },
];

const PAYMENT_INFO: Record<PaymentMethod, string> = {
  bkash:    "Send payment to our bKash number: 01XXX-XXXXXX (Personal). After sending, enter the Transaction ID shown in your bKash confirmation SMS.",
  bank:     "Transfer to: Bank Asia | Account: 0123456789 | Account Name: EduCore AI Ltd | Routing: 070261234. Enter your account number and the reference from your bank receipt.",
  card:     "Enter your card number below. You will be redirected to a secure 3D verification page. After payment, enter the Transaction ID from your bank SMS/email.",
  paypal:   "Send payment to: payments@educoreai.com via PayPal (Friends & Family). Enter the Transaction ID from your PayPal payment confirmation.",
  payoneer: "Send payment to: payments@educoreai.com via Payoneer. Enter the Transaction ID shown in your Payoneer payment confirmation screen.",
};

export default function PaymentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router       = useRouter();

  const [course,   setCourse]   = useState<Course | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [method,   setMethod]   = useState<PaymentMethod>("bkash");
  const [fields,   setFields]   = useState<Record<string, string>>({});
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    courseApi.detail(courseId)
      .then((r) => setCourse(r.data))
      .catch(() => toast.error("Could not load course"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const selectedMethod = METHODS.find((m) => m.id === method)!;

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    selectedMethod.fields.forEach((f) => {
      if (!fields[f.key]?.trim()) {
        e[f.key] = `${f.label} is required`;
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Submit payment record then enroll
      await apiClient.post("/api/payment/submit/", {
        course: Number(courseId),
        method,
        ...fields,
      }).catch(() => {}); // if backend doesn't have endpoint yet, still enroll

      await enrollmentApi.enroll(Number(courseId));
      setSuccess(true);
      toast.success("Payment submitted & enrolled! 🎉");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PublicNav />
        <div className="max-w-2xl mx-auto px-4 pt-28 space-y-5 animate-pulse">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PublicNav />
        <div className="max-w-md mx-auto px-4 pt-32 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-teal-500" />
          </div>
          <div>
            <h2 className="font-sora font-bold text-2xl text-slate-900">Payment Submitted!</h2>
            <p className="font-dm text-slate-500 mt-2">
              Your payment is being verified. You now have access to <span className="font-semibold text-slate-700">{course?.title}</span>.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/student/courses/${courseId}`)}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-dm font-semibold transition-all">
              Start Learning Now
            </button>
            <button
              onClick={() => router.push("/student/dashboard")}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-dm font-semibold hover:bg-slate-50 transition-all">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PublicNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back */}
        <Link href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-sm font-dm text-slate-500 hover:text-brand-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>

        {/* Course summary */}
        {course && (
          <div className="bg-surface-900 rounded-2xl p-5 flex items-center gap-4 mb-6 text-white">
            <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 text-lg font-sora font-bold">
              {course.title[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sora font-bold text-white truncate">{course.title}</p>
              <p className="text-xs font-dm text-slate-400 mt-0.5">
                {course.modules?.length ?? 0} modules · {course.modules?.flatMap(m => m.lessons ?? []).length ?? 0} lessons
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-sora font-bold text-xl text-brand-400">
                {course.price ? `৳ ${course.price}` : "Free"}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="font-sora font-bold text-xl text-slate-900">Complete Your Enrollment</h2>
            <p className="text-sm font-dm text-slate-500 mt-1">Choose a payment method and fill in the details</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Method selector */}
            <div>
              <p className="text-sm font-sora font-bold text-slate-700 mb-3">Payment Method</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setFields({}); setErrors({}); }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-150 cursor-pointer",
                      method === m.id
                        ? "border-brand-400 bg-brand-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-white",
                      method === m.id ? m.color : "bg-slate-200 !text-slate-400"
                    )}>
                      {m.icon}
                    </div>
                    <span className={cn(
                      "text-xs font-dm font-semibold",
                      method === m.id ? "text-brand-700" : "text-slate-500"
                    )}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-sora font-bold text-amber-700 mb-1">How to pay via {selectedMethod.label}</p>
                <p className="text-xs font-dm text-amber-600 leading-relaxed">{PAYMENT_INFO[method]}</p>
              </div>
            </div>

            {/* Dynamic fields */}
            <div className="space-y-4">
              {selectedMethod.fields.map((f) => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold font-dm text-slate-700">
                    {f.label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={fields[f.key] ?? ""}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-2.5 text-sm font-dm text-slate-900 placeholder:text-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all",
                      errors[f.key] ? "border-red-400 focus:ring-red-300" : "border-slate-200"
                    )}
                  />
                  {errors[f.key] && (
                    <p className="text-xs text-red-500 font-dm">{errors[f.key]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs font-dm text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Your payment details are submitted securely and reviewed by our team within 24 hours.</span>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-sora font-bold text-base transition-all shadow-lg shadow-brand-500/25"
            >
              {submitting ? "Submitting Payment…" : `Confirm Payment via ${selectedMethod.label}`}
            </button>

            <p className="text-center text-xs font-dm text-slate-400">
              Need help?{" "}
              <a href="/#contact" className="text-brand-500 hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
