import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PROJECT_TYPES } from '@/lib/constants';

export function useProjectTypes() {
  return useQuery({
    queryKey: ['project-types'],
    queryFn: async () => {
      const [{ data: seeds, error: seedsError }, { data: projects, error: projectsError }] = await Promise.all([
        supabase.from('seeds').select('project_type'),
        supabase.from('projects').select('project_types'),
      ]);

      if (seedsError) throw seedsError;
      if (projectsError) throw projectsError;

      const allTypes = new Set<string>(DEFAULT_PROJECT_TYPES as readonly string[]);

      for (const seed of seeds ?? []) {
        if (seed.project_type) {
          allTypes.add(seed.project_type);
        }
      }

      for (const project of projects ?? []) {
        for (const type of project.project_types ?? []) {
          if (type) {
            allTypes.add(type);
          }
        }
      }

      return Array.from(allTypes).sort((a, b) => a.localeCompare(b));
    },
  });
}
