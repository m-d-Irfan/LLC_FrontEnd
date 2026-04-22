import apiClient from "./axios";
import type {
  User,
  Course,
  Enrollment,
  LessonProgress,
  LoginPayload,
  RegisterPayload,
  AuthTokens,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<AuthTokens>("/api/auth/token/", data),

  register: (data: RegisterPayload) =>
    apiClient.post("/api/auth/register/", data),

  getMe: () => apiClient.get<User>("/api/user/me/"),
};

// ── Courses ───────────────────────────────────────────────────────────────
export const courseApi = {
  /** Public list — published courses only */
  list: () => apiClient.get<Course[]>("/api/course/"),

  /** Instructor's own courses — published + drafts */
  mine: () => apiClient.get<Course[]>("/api/course/mine/"),

  detail: (id: number | string) =>
    apiClient.get<Course>(`/api/course/${id}/`),

  create: (data: FormData) =>
    apiClient.post<Course>("/api/course/create/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** PATCH — pass a FormData so thumbnail uploads work */
  update: (id: number | string, data: FormData) =>
    apiClient.patch<Course>(`/api/course/${id}/update/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: number | string) =>
    apiClient.delete(`/api/course/${id}/delete/`),

  removeThumbnail: (id: number | string) =>
    apiClient.post(`/api/course/${id}/remove-thumbnail/`),
};

// ── Modules ───────────────────────────────────────────────────────────────
export const moduleApi = {
  create: (data: { course: number; title: string; order?: number }) =>
    apiClient.post(`/api/course/${data.course}/modules/create/`, {
      title: data.title,
      order: data.order ?? 1,
    }),

  update: (id: number, data: { title?: string; order?: number }) =>
    apiClient.patch(`/api/course/module/${id}/update/`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/course/module/${id}/delete/`),
};

// ── Lessons ───────────────────────────────────────────────────────────────
export const lessonApi = {
  create: (data: {
    module: number;
    title: string;
    content: string;
    video_url?: string;
    order?: number;
  }) =>
    apiClient.post(
      `/api/course/module/${data.module}/lessons/create/`,
      {
        title:     data.title,
        content:   data.content,
        video_url: data.video_url,
        order:     data.order ?? 1,
      }
    ),

  update: (id: number, data: { title?: string; content?: string; video_url?: string | null; order?: number }) =>
    apiClient.patch(`/api/course/lesson/${id}/update/`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/course/lesson/${id}/delete/`),
};

// ── Enrollment ────────────────────────────────────────────────────────────
export const enrollmentApi = {
  enroll: (courseId: number) =>
    apiClient.post("/api/enrollment/enroll/", { course: courseId }),

  myEnrollments: () => apiClient.get<Enrollment[]>("/api/enrollment/"),
};

// ── Progress ──────────────────────────────────────────────────────────────
export const progressApi = {
  complete: (lessonId: number) =>
    apiClient.post("/api/enrollment/progress/complete/", { lesson: lessonId }),

  myProgress: () =>
    apiClient.get<LessonProgress[]>("/api/enrollment/progress/"),
};

// ── Payment ───────────────────────────────────────────────────────────────
export const paymentApi = {
  submit: (data: {
    course: number;
    method: string;
    transaction_id: string;
    bank_account?: string;
    card_number?: string;
  }) => apiClient.post("/api/payment/submit/", data),

  myStatus: (courseId: number | string) =>
    apiClient.get(`/api/payment/status/${courseId}/`),
};

// ── Admin Panel ───────────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  stats: () =>
    apiClient.get("/api/admin/stats/"),

  // Users
  listUsers: () =>
    apiClient.get("/api/admin/users/"),
  deleteUser: (id: number, reason?: string) =>
    apiClient.delete(`/api/admin/users/${id}/delete/`, { data: { reason } }),

  // Instructors
  listInstructors: () =>
    apiClient.get("/api/admin/instructors/"),
  listPendingInstructors: () =>
    apiClient.get("/api/admin/instructors/pending/"),
  approveInstructor: (id: number) =>
    apiClient.post(`/api/admin/instructors/${id}/approve/`),
  rejectInstructor: (id: number, reason?: string) =>
    apiClient.post(`/api/admin/instructors/${id}/reject/`, { reason }),

  // Courses
  listCourses: () =>
    apiClient.get("/api/admin/courses/"),
  deleteCourse: (id: number, reason?: string) =>
    apiClient.delete(`/api/admin/courses/${id}/delete/`, { data: { reason } }),

  // Payments
  listPayments: () =>
    apiClient.get("/api/admin/payments/"),
  verifyPayment: (id: number, is_verified: boolean) =>
    apiClient.patch(`/api/admin/payments/${id}/verify/`, { is_verified }),

  // Enrollments
  listEnrollments: () =>
    apiClient.get("/api/admin/enrollments/"),
  cancelEnrollment: (id: number) =>
    apiClient.delete(`/api/admin/enrollments/${id}/cancel/`),
};