# EduCore AI — Frontend

A modern, fully responsive Learning Management System frontend built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variable (already set in .env.local)
# NEXT_PUBLIC_API_URL=https://llc-backend-rpyz.onrender.com

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## 🗂 Project Structure

```
educore-ai/
├── middleware.ts                    # Role-based route protection
├── .env.local                       # API base URL
│
└── src/
    ├── types/index.ts               # All shared TypeScript interfaces
    │
    ├── lib/
    │   ├── axios.ts                 # Axios instance + JWT interceptors
    │   ├── api.ts                   # All API call functions
    │   └── utils.ts                 # cn(), extractError(), formatDate()
    │
    ├── contexts/
    │   └── AuthContext.tsx          # Global auth state (login/register/logout)
    │
    ├── components/
    │   ├── ui/                      # Button, Input, Textarea, Card, Badge, Skeleton
    │   ├── layout/                  # AppShell (shell + mobile menu), Sidebar
    │   ├── courses/                 # CourseCard, ModuleAccordion
    │   └── instructor/              # AddModuleModal, AddLessonModal
    │
    └── app/
        ├── layout.tsx               # Root layout (fonts, Toaster, AuthProvider)
        ├── page.tsx                 # Root redirect based on role
        ├── not-found.tsx            # 404 page
        │
        ├── (auth)/
        │   ├── login/page.tsx       # Login form
        │   └── register/page.tsx    # Register form with role selector
        │
        ├── student/
        │   ├── dashboard/           # Stats + enrolled courses + progress
        │   ├── courses/             # Searchable course catalog
        │   ├── courses/[id]/        # Course detail + enroll + module accordion
        │   └── courses/[id]/lessons/[lessonId]/  # Lesson view + video + complete
        │
        └── instructor/
            ├── dashboard/           # Stats + all courses list
            ├── courses/create/      # Create course form
            └── courses/[id]/manage/ # Manage modules & lessons
```

---

## 🔐 Auth & Route Protection

| Cookie | Value | Purpose |
|---|---|---|
| `educore_access` | JWT access token | Attached to every API request |
| `educore_refresh` | JWT refresh token | Used to silently refresh expired access tokens |
| `educore_role` | `"student"` \| `"instructor"` | Used by middleware for role-based routing |

### Route Guards (middleware.ts)

| Path prefix | Allowed role |
|---|---|
| `/student/*` | `student` only |
| `/instructor/*` | `instructor` only |
| `/login`, `/register`, `/` | Public |

---

## 🔌 API Integration

All API calls live in `src/lib/api.ts`. The axios instance in `src/lib/axios.ts`:

1. **Request interceptor** — reads `educore_access` cookie and adds `Authorization: Bearer <token>` header
2. **Response interceptor** — on 401, uses `educore_refresh` cookie to call `/api/auth/token/refresh/`, updates the access cookie, and retries the original request automatically. Falls back to `/login` if refresh fails.

### Endpoints Used

| Method | Endpoint | Used in |
|---|---|---|
| POST | `/api/auth/register/` | Register page |
| POST | `/api/auth/token/` | Login page |
| POST | `/api/auth/token/refresh/` | Axios interceptor |
| GET | `/api/user/me/` | AuthContext bootstrap |
| GET | `/api/course/` | Catalog + Instructor dashboard |
| GET | `/api/course/:id/` | Course detail + Lesson view |
| POST | `/api/course/create/` | Create course page |
| POST | `/api/course/module/create/` | Add Module modal |
| POST | `/api/course/lesson/create/` | Add Lesson modal |
| POST | `/api/enrollment/enroll/` | Course detail (enroll button) |
| GET | `/api/enrollment/` | Student dashboard + catalog |
| POST | `/api/enrollment/progress/complete/` | Lesson view |
| GET | `/api/enrollment/progress/` | Student dashboard + lesson view |

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Primary** | Indigo — `brand-500` (#6366f1) |
| **Accent** | Teal — `teal-500` (#14b8a6) |
| **Background** | Slate — `surface-50` (#f8f9fc) |
| **Sidebar** | Dark — `surface-900` (#0f1117) |
| **Heading font** | Sora (Google Fonts) |
| **Body font** | DM Sans (Google Fonts) |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | Framework (App Router) |
| `axios` | HTTP client + interceptors |
| `js-cookie` | Cookie read/write (auth tokens) |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `clsx` + `tailwind-merge` | Conditional class merging |
| `framer-motion` | (Available, used optionally for animations) |

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env var on Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://llc-backend-rpyz.onrender.com
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `< lg` (< 1024px) | Mobile: hamburger menu, single-column grids |
| `≥ lg` (≥ 1024px) | Desktop: fixed sidebar, multi-column grids |

---

## 🔧 Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```
