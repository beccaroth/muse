import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project, Task } from '@/types';

export interface CalendarTask extends Task {
  project_name: string | null;
  project_icon: string | null;
}

export interface CalendarData {
  projects: Project[];
  tasks: CalendarTask[];
}

export function useCalendarData(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['calendar', startDate, endDate],
    queryFn: async (): Promise<CalendarData> => {
      // Fetch projects that have at least one date and overlap with the range
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .or(
          `and(start_date.lte.${endDate},end_date.gte.${startDate}),` +
          `and(start_date.is.null,end_date.lte.${endDate},end_date.gte.${startDate}),` +
          `and(end_date.is.null,start_date.lte.${endDate},start_date.gte.${startDate}),` +
          `and(start_date.lte.${endDate},start_date.gte.${startDate},end_date.is.null),` +
          `and(end_date.lte.${endDate},end_date.gte.${startDate},start_date.is.null)`
        );
      if (projectsError) throw projectsError;

      // Fetch tasks with due dates in range
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*, projects(project_name, icon)')
        .not('due_date', 'is', null)
        .gte('due_date', startDate)
        .lte('due_date', endDate);
      if (tasksError) throw tasksError;

      return {
        projects: (projects ?? []) as Project[],
        tasks: (tasks ?? []).map((t: Record<string, unknown>) => {
          const proj = t.projects as { project_name: string; icon: string | null } | null;
          return {
            ...t,
            project_name: proj?.project_name ?? null,
            project_icon: proj?.icon ?? null,
          } as CalendarTask;
        }),
      };
    },
    enabled: !!startDate && !!endDate,
  });
}
