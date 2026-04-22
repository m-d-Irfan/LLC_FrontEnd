export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_instructor: boolean;
  is_student: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "instructor";
}

export interface LoginPayload {
  username: string;
  password: string;
}

// Course types
export interface Course {
  id: number;
  title: string;
  description: string;
  created_by: string;      
  thumbnail?: string;        
  price: number;             
  is_published?: boolean;    
  created_at: string;
  modules?: Module[];
}

export interface Module {
  id: number;
  course: number;
  title: string;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  module: number;
  title: string;
  content?: string;          
  video_url?: string;
  order: number;
}

// Enrollment types
export interface Enrollment {
  id: number;
  student: number;
  course: Course;
  enrolled_at: string;
  progress?: number;
}

export interface LessonProgress {
  id: number;
  student: number;
  lesson: number;
  completed: boolean;
  completed_at?: string;
}

// API response shapes
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

// Payment types
export type PaymentMethod = "bkash" | "bank" | "card" | "paypal" | "payoneer";

export interface PaymentPayload {
  course: number;
  method: PaymentMethod;
  transaction_id?: string;   // bkash / paypal / payoneer
  bank_account?: string;     // bank transfer
  card_number?: string;      // card
}
