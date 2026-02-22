export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor";
  avatar_url: string | null;
  created_at: Date;
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number;
  price: string; // numeric comes back as string from postgres
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: Date;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  duration_minutes: number | null;
  created_at: Date;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: Date;
}

export interface LessonProgress {
  id: number;
  enrollment_id: number;
  lesson_id: number;
  completed_at: Date;
}

export interface CourseWithInstructor extends Course {
  instructor_name: string;
}

export interface CourseWithProgress extends Course {
  total_lessons: number;
  completed_lessons: number;
}
