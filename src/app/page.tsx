"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { courseApi } from "@/lib/api";
import PublicNav from "@/components/layout/PublicNav";
import CourseCard from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/ui/Skeleton";
import type { Course } from "@/types";
import {
  Sparkles, ArrowRight, Play, BookOpen, Trophy, Users,
  Zap, Brain, Video, Award, Clock,
  Star, ChevronRight, Mail, Phone, MapPin, Github, Twitter, Linkedin,
} from "lucide-react";

const FEATURES = [
  { icon: <Video className="w-6 h-6" />,         title: "Live Sessions",           desc: "Join real-time classes with expert instructors and ask questions live." },
  { icon: <Award className="w-6 h-6" />,          title: "Certificates",            desc: "Earn industry-recognised certificates upon completing any course." },
  { icon: <Clock className="w-6 h-6" />,          title: "Lifetime Access",         desc: "Pay once, learn forever. All course updates included at no extra cost." },
  { icon: <Users className="w-6 h-6" />,          title: "Community Support",       desc: "Join a thriving community of learners to share knowledge and grow together." },
  { icon: <BookOpen className="w-6 h-6" />,       title: "Quizzes & Assessments",   desc: "Test your knowledge after each module with smart, adaptive quizzes." },
  { icon: <Brain className="w-6 h-6" />,          title: "AI Tutor Support",        desc: "Get instant answers from our built-in AI tutor — available 24/7." },
];

const STATS = [
  { value: "500+",  label: "Courses",     icon: <BookOpen className="w-5 h-5" /> },
  { value: "12k+",  label: "Students",    icon: <Users className="w-5 h-5" /> },
  { value: "240+",  label: "Instructors", icon: <Trophy className="w-5 h-5" /> },
  { value: "4.9★",  label: "Avg Rating",  icon: <Star className="w-5 h-5" /> },
];

const TESTIMONIALS = [
  { name: "Rafi Islam",     role: "Junior Developer",     text: "EduCore AI changed my career. The AI tutor alone is worth it — it answered every question I had at 2am while studying.",     avatar: "R" },
  { name: "Nadia Hossain",  role: "UX Designer",          text: "The live sessions are incredibly interactive. My instructor actually knows each student by name. This is the future of online learning.", avatar: "N" },
  { name: "Karim Ahmed",    role: "Data Science Student",  text: "Finished the Python for Data Science course in 3 weeks. The quizzes kept me accountable and the certificate opened doors for me.", avatar: "K" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    courseApi.list()
      .then((r) => setCourses(r.data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dashHref = user
    ? user.is_instructor ? "/instructor/dashboard" : "/student/dashboard"
    : null;

  return (
    <div className="min-h-screen bg-white font-dm">
      <PublicNav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-surface-900">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-semibold text-brand-400 tracking-wide uppercase">
                AI-Powered Learning Platform
              </span>
            </div>

            <h1 className="font-sora font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
              Learn Programming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-400">
                from Industry
              </span>{" "}
              Experts
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 font-dm leading-relaxed mb-10 max-w-2xl">
              A smooth, AI-assisted learning experience that takes you from complete beginner to job-ready developer. Live sessions, certificates, quizzes, and an AI tutor — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-sora font-semibold text-base transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-600/40 group"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {dashHref ? (
                <Link
                  href={dashHref}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-sora font-semibold text-base transition-all border border-white/10"
                >
                  <LayoutDashIcon className="w-5 h-5" />
                  My Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-sora font-semibold text-base transition-all border border-white/10"
                >
                  <Play className="w-5 h-5" />
                  Start for Free
                </Link>
              )}
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-6 mt-12">
              {["No credit card required", "Cancel anytime", "Free courses available"].map((t) => (
                <span key={t} className="flex items-center gap-2 text-sm font-dm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs font-dm">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                  {s.icon}
                </div>
                <div>
                  <p className="font-sora font-bold text-3xl text-slate-900">{s.value}</p>
                  <p className="text-sm font-dm text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ──────────────────────────────────────────── */}
      <section className="bg-surface-50 py-24" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold font-dm uppercase tracking-widest text-brand-500 mb-2">
                What We Offer
              </p>
              <h2 className="font-sora font-bold text-4xl text-slate-900">Featured Courses</h2>
              <p className="text-slate-500 font-dm mt-2 max-w-lg">
                Handpicked courses taught by industry professionals. Some are free — start learning today.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-dm font-semibold text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap"
            >
              View all courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [1,2,3,4,5,6].map((i) => <CourseCardSkeleton key={i} />)
              : courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    href={`/courses/${course.id}`}
                  />
                ))}
          </div>

          {!loading && courses.length === 0 && (
            <div className="text-center py-16 text-slate-400 font-dm">
              Courses coming soon — check back shortly!
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="bg-white py-24" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold font-dm uppercase tracking-widest text-teal-500 mb-2">
              Everything You Need
            </p>
            <h2 className="font-sora font-bold text-4xl text-slate-900">
              Why Choose EduCore AI?
            </h2>
            <p className="text-slate-500 font-dm mt-3 max-w-xl mx-auto">
              We built the learning experience we always wished we had — packed with tools to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 flex items-center justify-center text-brand-500 mb-5 group-hover:from-brand-100 group-hover:to-teal-100 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-sora font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm font-dm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────── */}
      <section className="bg-surface-900 py-24" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold font-dm uppercase tracking-widest text-teal-400 mb-3">
                About EduCore AI
              </p>
              <h2 className="font-sora font-bold text-4xl text-white mb-6 leading-tight">
                We believe great education should be{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-400">
                  accessible to everyone
                </span>
              </h2>
              <p className="text-slate-400 font-dm leading-relaxed mb-5">
                EduCore AI was founded with a simple mission — to bridge the gap between traditional education and the skills the modern tech industry demands. We partner with working professionals who teach from real-world experience, not just theory.
              </p>
              <p className="text-slate-400 font-dm leading-relaxed mb-8">
                Our platform combines structured curriculum, live interaction, and AI-powered support to create a learning experience that adapts to you — not the other way around.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-dm font-semibold text-sm transition-all"
                >
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-dm font-semibold text-sm transition-all border border-white/10"
                >
                  Become an Instructor
                </Link>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Zap className="w-5 h-5" />,            title: "Fast-track Learning",  desc: "Structured paths that get you job-ready faster." },
                { icon: <Brain className="w-5 h-5" />,          title: "AI-Assisted",          desc: "24/7 AI tutor that answers your questions instantly." },
                { icon: <Users className="w-5 h-5" />,          title: "Community-Driven",     desc: "Learn alongside thousands of motivated peers." },
                { icon: <Award className="w-5 h-5" />,          title: "Verified Certificates", desc: "Credentials that employers actually recognise." },
              ].map((v) => (
                <div key={v.title} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                    {v.icon}
                  </div>
                  <p className="font-sora font-semibold text-white text-sm mb-1">{v.title}</p>
                  <p className="text-xs font-dm text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold font-dm uppercase tracking-widest text-brand-500 mb-2">
              Student Stories
            </p>
            <h2 className="font-sora font-bold text-4xl text-slate-900">What Our Students Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-slate-100 bg-surface-50 hover:shadow-md transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 font-dm text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-sora font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-sora font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs font-dm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-sora font-bold text-4xl sm:text-5xl text-white mb-5 leading-tight">
            Ready to start your journey?
          </h2>
          <p className="text-brand-100 font-dm text-lg mb-8 max-w-xl mx-auto">
            Join over 12,000 students already learning on EduCore AI. Your first course could be free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-600 font-sora font-bold text-base hover:bg-brand-50 transition-all shadow-xl"
            >
              Browse Free Courses <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 text-white font-sora font-bold text-base hover:bg-white/20 transition-all border border-white/20"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <section className="bg-white py-24" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-semibold font-dm uppercase tracking-widest text-brand-500 mb-3">Get In Touch</p>
              <h2 className="font-sora font-bold text-4xl text-slate-900 mb-5">We'd love to hear from you</h2>
              <p className="text-slate-500 font-dm leading-relaxed mb-8">
                Have a question about a course, payment, or partnership? Our team is here to help you within 24 hours.
              </p>
              <div className="space-y-5">
                {[
                  { icon: <Mail className="w-5 h-5" />,    label: "Email",    value: "hello@educoreai.com" },
                  { icon: <Phone className="w-5 h-5" />,   label: "WhatsApp", value: "+880 1XXX-XXXXXX" },
                  { icon: <MapPin className="w-5 h-5" />,  label: "Location", value: "Dhaka, Bangladesh" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs font-dm text-slate-400">{c.label}</p>
                      <p className="text-sm font-dm font-semibold text-slate-700">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-surface-50 rounded-3xl p-8 border border-slate-100">
              <h3 className="font-sora font-bold text-xl text-slate-900 mb-6">Send a Message</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold font-dm text-slate-700">First Name</label>
                    <input className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-dm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all" placeholder="Jane" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold font-dm text-slate-700">Last Name</label>
                    <input className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-dm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all" placeholder="Doe" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold font-dm text-slate-700">Email</label>
                  <input type="email" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-dm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all" placeholder="jane@example.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold font-dm text-slate-700">Message</label>
                  <textarea rows={4} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-dm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all" placeholder="Your message..." />
                </div>
                <button className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-dm font-semibold text-sm transition-all shadow-lg shadow-brand-500/25">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="bg-surface-900 text-slate-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-sora font-bold text-white">EduCore <span className="text-brand-400">AI</span></span>
              </div>
              <p className="text-sm font-dm leading-relaxed mb-5">
                Learn programming from industry experts with a smooth, AI-powered experience.
              </p>
              <div className="flex gap-3">
                {[<Twitter className="w-4 h-4" key="tw"/>, <Github className="w-4 h-4" key="gh"/>, <Linkedin className="w-4 h-4" key="li"/>].map((icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { heading: "Platform", links: ["Courses", "Instructors", "Community", "AI Tutor"] },
              { heading: "Company",  links: ["About Us", "Blog", "Careers", "Press"] },
              { heading: "Support",  links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="font-sora font-semibold text-white text-sm mb-4">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm font-dm text-slate-400 hover:text-white transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-dm text-slate-500">© 2025 EduCore AI. All rights reserved.</p>
            <p className="text-xs font-dm text-slate-500">Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// small inline icon to avoid extra import
function LayoutDashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
