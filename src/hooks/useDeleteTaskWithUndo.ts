import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types';
import { toast } from 'sonner';

const UNDO_TIMEOUT = 5000;

const insertSorted = (tasks: Task[], task: Task) => {
  const next = [...tasks.filter((t) => t.id !== task.id), task];
  next.sort((a, b) => a.sort_order - b.sort_order);
  return next;
};

// Keyed by task id so deleting several tasks in a row commits each one, instead of the
// newest delete cancelling the pending write for the previous. Module-level so a pending
// delete survives unmount and its Undo keeps working.
const pending = new Map<string, { task: Task; timeoutId: ReturnType<typeof setTimeout> }>();

export function useDeleteTaskWithUndo() {
  const queryClient = useQueryClient();

  const commitDelete = useCallback(
    async (taskId: string) => {
      const entry = pending.get(taskId);
      if (!entry) return;

      clearTimeout(entry.timeoutId);
      pending.delete(taskId);

      const { error } = await supabase.from('tasks').delete().eq('id', taskId);

      if (error) {
        queryClient.invalidateQueries({ queryKey: ['tasks', entry.task.project_id] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        toast.error('Failed to delete task');
      }
    },
    [queryClient],
  );

  const deleteTask = useCallback(
    async (task: Task) => {
      // Optimistically remove from cache
      queryClient.setQueryData<Task[]>(['tasks', task.project_id], (old) =>
        old?.filter((t) => t.id !== task.id) ?? []
      );
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.filter((t) => t.id !== task.id) ?? []
      );

      const timeoutId = setTimeout(() => {
        void commitDelete(task.id);
      }, UNDO_TIMEOUT);

      pending.set(task.id, { task, timeoutId });

      toast.success(`"${task.title}" deleted`, {
        duration: UNDO_TIMEOUT,
        action: {
          label: 'Undo',
          onClick: () => {
            const entry = pending.get(task.id);
            if (!entry) return;

            clearTimeout(entry.timeoutId);
            pending.delete(task.id);

            const restoredTask = entry.task;
            queryClient.setQueryData<Task[]>(['tasks', restoredTask.project_id], (old) =>
              old ? insertSorted(old, restoredTask) : [restoredTask]
            );
            queryClient.setQueryData<Task[]>(['tasks'], (old) =>
              old ? insertSorted(old, restoredTask) : [restoredTask]
            );

            toast.success(`"${restoredTask.title}" restored`);
          },
        },
      });
    },
    [queryClient, commitDelete]
  );

  return { deleteTask };
}
