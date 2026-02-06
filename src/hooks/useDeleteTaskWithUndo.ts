import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types';
import { toast } from 'sonner';

const UNDO_TIMEOUT = 5000;

export function useDeleteTaskWithUndo() {
  const queryClient = useQueryClient();
  const pendingDeleteRef = useRef<{
    task: Task;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const deleteTask = useCallback(
    async (task: Task) => {
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timeoutId);
        pendingDeleteRef.current = null;
      }

      // Optimistically remove from cache
      queryClient.setQueryData<Task[]>(['tasks', task.project_id], (old) =>
        old?.filter((t) => t.id !== task.id) ?? []
      );

      const timeoutId = setTimeout(async () => {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', task.id);

        if (error) {
          queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id] });
          toast.error('Failed to delete task');
        }

        pendingDeleteRef.current = null;
      }, UNDO_TIMEOUT);

      pendingDeleteRef.current = { task, timeoutId };

      toast.success(`"${task.title}" deleted`, {
        duration: UNDO_TIMEOUT,
        action: {
          label: 'Undo',
          onClick: () => {
            if (pendingDeleteRef.current) {
              clearTimeout(pendingDeleteRef.current.timeoutId);
              const restoredTask = pendingDeleteRef.current.task;
              pendingDeleteRef.current = null;

              queryClient.setQueryData<Task[]>(['tasks', restoredTask.project_id], (old) => {
                if (!old) return [restoredTask];
                // Re-insert at original sort position
                const updated = [...old, restoredTask];
                updated.sort((a, b) => a.sort_order - b.sort_order);
                return updated;
              });

              toast.success(`"${restoredTask.title}" restored`);
            }
          },
        },
      });
    },
    [queryClient]
  );

  return { deleteTask };
}
