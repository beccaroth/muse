import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';
import { toast } from 'sonner';

const UNDO_TIMEOUT = 5000; // 5 seconds

// Keyed by project id, and module-level rather than a ref: deletes are independent, so
// starting a second one must not discard the first (a single shared slot was cleared on
// each new delete, cancelling the pending write — the project stayed gone from the cache
// but came back on the next refetch). Module scope also keeps a pending delete alive
// across unmount, so deleting from the project page and navigating away still commits,
// and the Undo button on the still-visible toast keeps working.
const pending = new Map<
  string,
  { project: Project; timeoutId: ReturnType<typeof setTimeout> }
>();

export function useDeleteProjectWithUndo() {
  const queryClient = useQueryClient();

  const commitDelete = useCallback(
    async (projectId: string) => {
      const entry = pending.get(projectId);
      if (!entry) return;

      clearTimeout(entry.timeoutId);
      pending.delete(projectId);

      // Select the deleted rows: a DELETE that RLS filters out returns 204 with no
      // error, so `error` alone would report success for a row that still exists.
      const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .select('id');

      if (error || !data?.length) {
        // Resync with whatever the server still has
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project-types'] });
        toast.error('Failed to delete project');
      }
    },
    [queryClient],
  );

  const deleteProject = useCallback(
    async (project: Project, onDeleted?: () => void) => {
      // A refetch inside the undo window re-surfaces a row whose delete hasn't committed
      // yet, so the same row can be deleted twice. Retire the previous timer instead of
      // leaking it, otherwise it fires early and commits ahead of the new undo window.
      const inFlight = pending.get(project.id);
      if (inFlight) clearTimeout(inFlight.timeoutId);

      // Optimistically remove from cache
      queryClient.setQueryData<Project[]>(['projects'], (old) =>
        old?.filter((p) => p.id !== project.id) ?? []
      );

      // Call onDeleted callback (e.g., to navigate away or close dialog)
      onDeleted?.();

      const timeoutId = setTimeout(() => {
        void commitDelete(project.id);
      }, UNDO_TIMEOUT);

      pending.set(project.id, { project, timeoutId });

      toast.success(`"${project.project_name}" deleted`, {
        duration: UNDO_TIMEOUT,
        action: {
          label: 'Undo',
          onClick: () => {
            const entry = pending.get(project.id);
            if (!entry) return;

            clearTimeout(entry.timeoutId);
            pending.delete(project.id);

            // Restore to cache (at the front, since the list is created_at desc)
            queryClient.setQueryData<Project[]>(['projects'], (old) => {
              if (!old) return [entry.project];
              if (old.some((p) => p.id === entry.project.id)) return old;
              return [entry.project, ...old];
            });

            toast.success(`"${entry.project.project_name}" restored`);
          },
        },
      });
    },
    [queryClient, commitDelete]
  );

  return { deleteProject };
}
