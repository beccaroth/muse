import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CheckSquare, Eye, EyeOff } from 'lucide-react';
import { useAllTasks, useUpdateTask } from '@/hooks/useTasks';
import { useDeleteTaskWithUndo } from '@/hooks/useDeleteTaskWithUndo';
import { useProjects } from '@/hooks/useProjects';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, Project } from '@/types';

export function TasksPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useAllTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const updateTask = useUpdateTask();
  const { deleteTask } = useDeleteTaskWithUndo();
  const [showCompleted, setShowCompleted] = useState(true);

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );

  const grouped = useMemo(() => {
    const filtered = showCompleted ? tasks : tasks.filter((t) => !t.completed);
    const groups = new Map<string, Task[]>();
    for (const task of filtered) {
      const list = groups.get(task.project_id) ?? [];
      list.push(task);
      groups.set(task.project_id, list);
    }
    return groups;
  }, [tasks, showCompleted]);

  const completedCount = tasks.filter((t) => t.completed).length;

  if (tasksLoading || projectsLoading) {
    return <Loading className="py-20" />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">Tasks</h1>
        </div>
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

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tasks yet. Add tasks from a project page.
        </p>
      ) : grouped.size === 0 ? (
        <p className="text-muted-foreground text-sm">
          All tasks are completed.
        </p>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([projectId, projectTasks]) => {
            const project = projectMap.get(projectId);
            return (
              <ProjectTaskGroup
                key={projectId}
                project={project}
                projectId={projectId}
                tasks={projectTasks}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

function ProjectTaskGroup({
  project,
  projectId,
  tasks,
  updateTask,
  deleteTask,
}: {
  project: Project | undefined;
  projectId: string;
  tasks: Task[];
  updateTask: ReturnType<typeof useUpdateTask>;
  deleteTask: ReturnType<typeof useDeleteTaskWithUndo>['deleteTask'];
}) {
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-3">
        <Link
          to="/project/$projectId"
          params={{ projectId }}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {project?.icon && <span>{project.icon}</span>}
          <h2 className="font-semibold">
            {project?.project_name ?? 'Unknown project'}
          </h2>
        </Link>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{tasks.length} done
        </span>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
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
                task.completed && 'line-through text-muted-foreground',
              )}
            >
              {task.title}
            </span>
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
    </div>
  );
}
