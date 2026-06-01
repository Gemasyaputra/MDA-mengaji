export type UserRole = 'teacher' | 'admin' | 'parent' | null;

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
}

export interface StudyGroup {
  id: number;
  teacher_id: number | null;
  name: string;
  teacher_name?: string; // Optional, sometimes joined
}

export interface Santri {
  id: number;
  group_id: number | null;
  name: string;
  slug: string;
  parent_name: string | null;
  parent_phone: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  current_level: string | null;
  group_name?: string | null;
}

export interface Post {
  id: number;
  author: string;
  author_id: number;
  title: string;
  content: string;
  timestamp: string;
  avatar: string;
  created_at?: string;
  activity_date?: string;
  images?: string[];
}
