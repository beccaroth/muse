import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Seed, Project } from '@/types';
import { toast } from 'sonner';

const UNDO_TIMEOUT = 5000; // 5 seconds

// Keyed by seed id. A single pending slot meant promoting a second seed within the undo
// window cancelled the first promotion outright: the seed was already gone from the cache
// and no project was ever created, so the idea vanished on refresh. Module-level so a
// pending promotion survives unmount and its Undo keeps working.
const pending = new Map<
  string,
  { seed: Seed; tempProjectId: string; timeoutId: ReturnType<typeof setTimeout> }
>();

export function usePromoteSeedWithUndo() {
  const queryClient = useQueryClient();

  const commitPromotion = useCallback(
    async (seedId: string) => {
      const entry = pending.get(seedId);
      if (!entry) return;

      clearTimeout(entry.timeoutId);
      pending.delete(seedId);

      const { seed, tempProjectId } = entry;

      try {
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert({
            project_name: seed.title,
            icon: seed.icon,
            description: seed.description,
            project_types: seed.project_type ? [seed.project_type] : [],
            status: 'Not started',
            priority: 'Someday',
            progress: 0,
            start_date: null,
            end_date: null,
          })
          .select()
          .single();

        if (createError) throw createError;

        const { error: deleteError } = await supabase
          .from('seeds')
          .delete()
          .eq('id', seed.id);

        if (deleteError) throw deleteError;

        // Replace optimistic project with real one
        queryClient.setQueryData<Project[]>(['projects'], (old) => {
          if (!old) return [newProject as Project];
          return old.map((p) =>
            p.id === tempProjectId ? (newProject as Project) : p
          );
        });
        queryClient.invalidateQueries({ queryKey: ['project-types'] });
      } catch {
        // If promotion fails, restore the seed and remove temp project
        queryClient.invalidateQueries({ queryKey: ['seeds'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.error('Failed to promote seed');
      }
    },
    [queryClient],
  );

  const promoteSeed = useCallback(
    async (seed: Seed) => {
      // Generate a temporary ID for optimistic update
      const tempProjectId = crypto.randomUUID();

      // Optimistically remove seed from cache
      queryClient.setQueryData<Seed[]>(['seeds'], (old) =>
        old?.filter((s) => s.id !== seed.id) ?? []
      );

      // Create optimistic project
      const now = new Date().toISOString();
      const optimisticProject: Project = {
        id: tempProjectId,
        project_name: seed.title,
        icon: seed.icon,
        description: seed.description,
        notes: null,
        project_types: seed.project_type ? [seed.project_type] : [],
        status: 'Not started',
        priority: 'Someday',
        progress: 0,
        start_date: null,
        end_date: null,
        created_at: now,
        updated_at: now,
      };

      // Optimistically add project to cache
      queryClient.setQueryData<Project[]>(['projects'], (old) => {
        if (!old) return [optimisticProject];
        return [optimisticProject, ...old];
      });

      const timeoutId = setTimeout(() => {
        void commitPromotion(seed.id);
      }, UNDO_TIMEOUT);

      pending.set(seed.id, { seed, tempProjectId, timeoutId });

      toast.success(`"${seed.title}" promoted to project!`, {
        duration: UNDO_TIMEOUT,
        action: {
          label: 'Undo',
          onClick: () => {
            const entry = pending.get(seed.id);
            if (!entry) return;

            clearTimeout(entry.timeoutId);
            pending.delete(seed.id);

            const { seed: restoredSeed, tempProjectId: tempId } = entry;

            // Remove temp project from cache
            queryClient.setQueryData<Project[]>(['projects'], (old) =>
              old?.filter((p) => p.id !== tempId) ?? []
            );

            // Restore seed to cache
            queryClient.setQueryData<Seed[]>(['seeds'], (old) => {
              if (!old) return [restoredSeed];
              if (old.some((s) => s.id === restoredSeed.id)) return old;
              return [restoredSeed, ...old];
            });

            toast.success(`"${restoredSeed.title}" restored to seeds`);
          },
        },
      });
    },
    [queryClient, commitPromotion]
  );

  return { promoteSeed };
}
