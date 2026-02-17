import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useDeleteTaskWithUndo } from '@/hooks/useDeleteTaskWithUndo';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus, X } from 'lucide-react';
import { TaskDueDatePicker } from '@/components/calendar/TaskDueDatePicker';
import { cn } from '@/lib/utils';

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { data: tasks = [] } = useTasks(projectId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { deleteTask } = useDeleteTaskWithUndo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  const handleAddTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    createTask.mutate(
      { project_id: projectId, title, completed: false, sort_order: tasks.length, due_date: null },
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
                onCheckedChange={() =>
                  updateTask.mutate({ id: task.id, projectId, completed: !task.completed })
                }
              />
              <span
                className={cn(
                  'flex-1 text-sm',
                  task.completed && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </span>
              <TaskDueDatePicker
                dueDate={task.due_date}
                onDateChange={(date) =>
                  updateTask.mutate({ id: task.id, projectId, due_date: date })
                }
                compact
              />
              <button
                onClick={() => deleteTask(task)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                aria-label={`Delete "${task.title}"`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
