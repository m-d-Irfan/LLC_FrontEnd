"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { extractError } from "@/lib/utils";
import { Sparkles, User, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password)        e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      toast.success("Welcome back!");
      // Redirect based on role
      const role = document.cookie.includes("educore_role=admin") ? "admin"
        : document.cookie.includes("educore_role=instructor") ? "instructor"
        : "student";
      if (role === "admin") router.push("/admin-panel");
      else router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "pending_approval") {
        toast.error(
          "Your instructor account is awaiting admin approval. You'll receive an email once approved.",
          { duration: 6000 }
        );
      } else if (msg === "account_rejected") {
        toast.error(
          "Your instructor application was rejected. Please check your email for details.",
          { duration: 6000 }
        );
      } else {
        toast.error(extractError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-surface-900 p-12">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-sora font-bold text-xl text-white">
              EduCore <span className="text-brand-400">AI</span>
            </span>
          </div>
        </Link>

        {/* Hero text */}
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-dm font-semibold uppercase tracking-widest text-teal-400">
              Learning Management System
            </p>
            <h1 className="font-sora font-bold text-5xl text-white leading-tight">
              Knowledge is the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-400">only</span> currency.
            </h1>
            <p className="font-dm text-slate-400 text-lg leading-relaxed max-w-md">
              Join thousands of students and instructors building the future of education — one lesson at a time.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { label: "Courses", value: "500+" },
              { label: "Students", value: "12k+" },
              { label: "Instructors", value: "240+" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-sora font-bold text-2xl text-white">{s.value}</p>
                <p className="text-sm font-dm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <p className="text-sm font-dm text-slate-600 italic">
          "The beautiful thing about learning is that no one can take it away from you." — B.B. King
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-sora font-bold text-lg text-slate-900">
                EduCore <span className="text-brand-500">AI</span>
              </span>
            </div>
          </Link>

          <div className="mb-8">
            <h2 className="font-sora font-bold text-3xl text-slate-900">Welcome back</h2>
            <p className="font-dm text-slate-500 mt-2">Sign in to continue your learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm font-dm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}