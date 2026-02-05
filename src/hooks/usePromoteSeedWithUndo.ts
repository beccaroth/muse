import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Seed, Project } from '@/types';
import { toast } from 'sonner';

const UNDO_TIMEOUT = 5000; // 5 seconds

export function usePromoteSeedWithUndo() {
  const queryClient = useQueryClient();
  const pendingPromoteRef = useRef<{
    seed: Seed;
    tempProjectId: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const promoteSeed = useCallback(
    async (seed: Seed) => {
      // Cancel any pending promotion
      if (pendingPromoteRef.current) {
        clearTimeout(pendingPromoteRef.current.timeoutId);
        pendingPromoteRef.current = null;
      }

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

      // Set up the pending promotion
      const timeoutId = setTimeout(async () => {
        try {
          // Actually create the project in database
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

          // Delete the seed from database
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
        } catch {
          // If promotion fails, restore the seed and remove temp project
          queryClient.invalidateQueries({ queryKey: ['seeds'] });
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          toast.error('Failed to promote seed');
        }

        pendingPromoteRef.current = null;
      }, UNDO_TIMEOUT);

      pendingPromoteRef.current = { seed, tempProjectId, timeoutId };

      // Show toast with undo option
      toast.success(`"${seed.title}" promoted to project!`, {
        duration: UNDO_TIMEOUT,
        action: {
          label: 'Undo',
          onClick: () => {
            if (pendingPromoteRef.current) {
              clearTimeout(pendingPromoteRef.current.timeoutId);
              const { seed: restoredSeed, tempProjectId } =
                pendingPromoteRef.current;
              pendingPromoteRef.current = null;

              // Remove temp project from cache
              queryClient.setQueryData<Project[]>(['projects'], (old) =>
                old?.filter((p) => p.id !== tempProjectId) ?? []
              );

              // Restore seed to cache
              queryClient.setQueryData<Seed[]>(['seeds'], (old) => {
                if (!old) return [restoredSeed];
                return [restoredSeed, ...old];
              });

              toast.success(`"${restoredSeed.title}" restored to seeds`);
            }
          },
        },
      });
    },
    [queryClient]
  );

  return { promoteSeed };
}
