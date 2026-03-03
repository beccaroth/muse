import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useDeleteTaskWithUndo } from '@/hooks/useDeleteTaskWithUndo';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Check, Eye, EyeOff, Pencil, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useViewStore } from '@/stores/viewStore';

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { data: tasks = [] } = useTasks(projectId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { deleteTask } = useDeleteTaskWithUndo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const showCompleted = useViewStore((state) => state.showCompletedTasks);
  const setShowCompleted = useViewStore((state) => state.setShowCompletedTasks);

  const handleAddTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    createTask.mutate(
      { project_id: projectId, title, completed: false, sort_order: tasks.length },
      { onSuccess: () => setNewTaskTitle('') }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const visibleTasks = showCompleted ? tasks : tasks.filter((t) => !t.completed);
  const isSavingEdit = updateTask.isPending;

  const startEditingTask = (task: { id: string; title: string }) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const saveEditingTask = (taskId: string) => {
    const title = editingTaskTitle.trim();
    if (!title) return;

    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    if (currentTask.title === title) {
      cancelEditingTask();
      return;
    }

    updateTask.mutate(
      { id: taskId, projectId, title },
      {
        onSuccess: () => cancelEditingTask(),
      }
    );
  };

  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Tasks</h2>
        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-muted-foreground text-xs h-auto py-1 px-2"
          >
            {showCompleted ? (
              <><EyeOff className="h-3.5 w-3.5 mr-1" /> Hide completed</>
            ) : (
              <><Eye className="h-3.5 w-3.5 mr-1" /> Show completed ({completedCount})</>
            )}
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={createTask.isPending}
        />
        <Button
          size="sm"
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || createTask.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {visibleTasks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {visibleTasks.map((task) => (
            <li key={task.id} className="group flex items-center gap-3">
              <Checkbox
                checked={task.completed}
                disabled={editingTaskId === task.id}
                onCheckedChange={() =>
                  updateTask.mutate({ id: task.id, projectId, completed: !task.completed })
                }
              />
              {editingTaskId === task.id ? (
                <>
                  <Input
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="h-8 flex-1 text-sm"
                    autoFocus
                    disabled={isSavingEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEditingTask(task.id);
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEditingTask();
                      }
                    }}
                  />
                  <button
                    onClick={() => saveEditingTask(task.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Save "${task.title}"`}
                    disabled={isSavingEdit || !editingTaskTitle.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditingTask}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Cancel editing "${task.title}"`}
                    disabled={isSavingEdit}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      task.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => startEditingTask(task)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    aria-label={`Edit "${task.title}"`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    aria-label={`Delete "${task.title}"`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
