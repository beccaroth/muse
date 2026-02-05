import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';
import { toast } from 'sonner';

const UNDO_TIMEOUT = 5000; // 5 seconds

export function useDeleteProjectWithUndo() {
  const queryClient = useQueryClient();
  const pendingDeleteRef = useRef<{
    project: Project;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const deleteProject = useCallback(
    async (project: Project, onDeleted?: () => void) => {
      // Cancel any pending delete
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timeoutId);
        pendingDeleteRef.current = null;
      }

      // Optimistically remove from cache
      queryClient.setQueryData<Project[]>(['projects'], (old) =>
        old?.filter((p) => p.id !== project.id) ?? []
      );

      // Call onDeleted callback (e.g., to navigate away or close dialog)
      onDeleted?.();

      // Set up the pending delete
      const timeoutId = setTimeout(async () => {
        // Actually delete from database
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', project.id);

        if (error) {
          // If delete fails, restore the project in cache
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          toast.error('Failed to delete project');
        }

        pendingDeleteRef.current = null;
      }, UNDO_TIMEOUT);

      pendingDeleteRef.current = { project, timeoutId };

      // Show toast with undo option
      toast.success(`"${project.project_name}" deleted`, {
        duration: UNDO_TIMEOUT,
        action: {
          label: 'Undo',
          onClick: () => {
            if (pendingDeleteRef.current) {
              clearTimeout(pendingDeleteRef.current.timeoutId);
              const restoredProject = pendingDeleteRef.current.project;
              pendingDeleteRef.current = null;

              // Restore to cache
              queryClient.setQueryData<Project[]>(['projects'], (old) => {
                if (!old) return [restoredProject];
                // Add back in original position (at beginning since sorted by created_at desc)
                return [restoredProject, ...old];
              });

              toast.success(`"${restoredProject.project_name}" restored`);
            }
          },
        },
      });
    },
    [queryClient]
  );

  return { deleteProject };
}
