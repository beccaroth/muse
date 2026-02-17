import type { ProjectStatus, ProjectPriority, ProjectType } from '@/lib/constants';

export interface Project {
  id: string;
  project_name: string;
  icon: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  project_types: ProjectType[];
  description: string | null;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Seed {
  id: string;
  title: string;
  icon: string | null;
  description: string | null;
  project_type: ProjectType | null;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TwelveWeekCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TwelveWeekCycleInsert = Omit<TwelveWeekCycle, 'id' | 'created_at' | 'updated_at'>;
export type TwelveWeekCycleUpdate = Partial<TwelveWeekCycleInsert> & { id: string };

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert> & { id: string };

export type SeedInsert = Omit<Seed, 'id' | 'created_at' | 'updated_at'>;
export type SeedUpdate = Partial<SeedInsert> & { id: string };

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'project_id' | 'created_at' | 'updated_at'>> & { id: string };
