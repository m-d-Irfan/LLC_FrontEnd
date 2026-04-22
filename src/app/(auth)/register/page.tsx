"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { extractError } from "@/lib/utils";
import { Sparkles, User, Mail, Lock, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";


type Role = "student" | "instructor";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role,      setRole]      = useState<Role>("student");
  const [username,  setUsername]  = useState("");
  const [email,     setEmail]     = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim())     e.username = "Username is required";
    if (!email.trim())        e.email    = "Email is required";
    if (!password)            e.password = "Password is required";
    if (password.length < 8)  e.password = "Password must be at least 8 characters";
    if (password !== confirm) e.confirm  = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        role,
      });
      toast.success("Account created! Welcome to EduCore AI 🎉");
      router.push("/");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-sora font-bold text-xl text-slate-900">
              EduCore <span className="text-brand-500">AI</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="mb-7 text-center">
            <h2 className="font-sora font-bold text-2xl text-slate-900">Create your account</h2>
            <p className="font-dm text-slate-500 mt-1.5 text-sm">Join EduCore AI and start learning today.</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 font-dm mb-3">I want to join as</p>
            <div className="grid grid-cols-2 gap-3">
              {(["student", "instructor"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer",
                    role === r
                      ? "border-brand-400 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    role === r ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {r === "student" ? <GraduationCap className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-sm font-semibold font-dm capitalize",
                    role === r ? "text-brand-700" : "text-slate-600"
                  )}>
                    {r}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-sora font-bold text-slate-900">
                EduCore <span className="text-brand-500">AI</span>
              </span>
            </Link>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <Input
              label="Username"
              placeholder="jane_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
            />

            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-2 group"
            >
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <p className="mt-5 text-center text-sm font-dm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
