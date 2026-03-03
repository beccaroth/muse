import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpDown, Check, CheckSquare, ChevronsUpDown, Eye, EyeOff, Pencil, Plus, X } from 'lucide-react';
import { useAllTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useDeleteTaskWithUndo } from '@/hooks/useDeleteTaskWithUndo';
import { useProjects } from '@/hooks/useProjects';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useViewStore } from '@/stores/viewStore';
import type { Task, Project } from '@/types';
import { toast } from 'sonner';
import type { TaskProjectSortOption } from '@/stores/viewStore';

export function TasksPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useAllTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { deleteTask } = useDeleteTaskWithUndo();
  const showCompleted = useViewStore((state) => state.showCompletedTasks);
  const setShowCompleted = useViewStore((state) => state.setShowCompletedTasks);
  const projectSort = useViewStore((state) => state.taskProjectSort);
  const setProjectSort = useViewStore((state) => state.setTaskProjectSort);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const projectSortLabel: Record<TaskProjectSortOption, string> = {
    'name-asc': 'A-Z',
    'name-desc': 'Z-A',
    newest: 'Newest',
    oldest: 'Oldest',
  };

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );
  const selectedProject = selectedProjectId ? projectMap.get(selectedProjectId) : undefined;

  const grouped = useMemo(() => {
    const groups = new Map<string, {
      visibleTasks: Task[];
      totalCount: number;
      completedCount: number;
    }>();

    for (const task of tasks) {
      const group = groups.get(task.project_id) ?? {
        visibleTasks: [],
        totalCount: 0,
        completedCount: 0,
      };

      group.totalCount += 1;
      if (task.completed) {
        group.completedCount += 1;
      }
      if (showCompleted || !task.completed) {
        group.visibleTasks.push(task);
      }

      groups.set(task.project_id, group);
    }

    for (const [projectId, group] of groups.entries()) {
      if (group.visibleTasks.length === 0) {
        groups.delete(projectId);
      }
    }

    return groups;
  }, [tasks, showCompleted]);

  const sortedProjectGroups = useMemo(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
    const entries = [...grouped.entries()];

    entries.sort(([projectIdA], [projectIdB]) => {
      const projectA = projectMap.get(projectIdA);
      const projectB = projectMap.get(projectIdB);

      const projectNameA = projectA?.project_name ?? '';
      const projectNameB = projectB?.project_name ?? '';
      const projectCreatedAtA = projectA?.created_at ?? '';
      const projectCreatedAtB = projectB?.created_at ?? '';

      let comparison = 0;
      if (projectSort === 'name-asc') {
        comparison = collator.compare(projectNameA, projectNameB);
      } else if (projectSort === 'name-desc') {
        comparison = collator.compare(projectNameB, projectNameA);
      } else if (projectSort === 'newest') {
        comparison = projectCreatedAtA < projectCreatedAtB ? 1 : projectCreatedAtA > projectCreatedAtB ? -1 : 0;
      } else {
        comparison = projectCreatedAtA < projectCreatedAtB ? -1 : projectCreatedAtA > projectCreatedAtB ? 1 : 0;
      }

      if (comparison !== 0) {
        return comparison;
      }

      return projectIdA.localeCompare(projectIdB);
    });

    return entries;
  }, [grouped, projectMap, projectSort]);

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleToggleAddTask = () => {
    setIsAddTaskOpen((open) => {
      const nextOpen = !open;
      if (!nextOpen) {
        setFormError(null);
      }
      return nextOpen;
    });
  };

  const handleAddTask = () => {
    const title = newTaskTitle.trim();
    if (!title) {
      setFormError('Task title is required.');
      return;
    }
    if (!selectedProjectId) {
      setFormError('Please select a project.');
      return;
    }
    setFormError(null);

    const projectTaskCount = tasks.filter((task) => task.project_id === selectedProjectId).length;
    createTask.mutate(
      {
        project_id: selectedProjectId,
        title,
        completed: false,
        sort_order: projectTaskCount,
      },
      {
        onSuccess: () => {
          const projectName = projectMap.get(selectedProjectId)?.project_name ?? 'project';
          toast.success(`"${title}" added to ${projectName}`);
          setNewTaskTitle('');
          setSelectedProjectId('');
          setIsAddTaskOpen(false);
          setFormError(null);
        },
        onError: () => {
          toast.error('Failed to add task');
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  if (tasksLoading || projectsLoading) {
    return <Loading className="py-20" />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">Tasks</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                  Sort: {projectSortLabel[projectSort]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={projectSort}
                  onValueChange={(value) => setProjectSort(value as TaskProjectSortOption)}
                >
                  <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={isAddTaskOpen ? 'secondary' : 'default'}
              size="sm"
              onClick={handleToggleAddTask}
              disabled={projects.length === 0}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {isAddTaskOpen ? 'Cancel' : 'Add Task'}
            </Button>
            {completedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="hidden text-muted-foreground text-xs h-auto py-1 px-2 sm:inline-flex"
              >
                {showCompleted ? (
                  <><EyeOff className="h-3.5 w-3.5 mr-1" /> Hide completed</>
                ) : (
                  <><Eye className="h-3.5 w-3.5 mr-1" /> Show completed ({completedCount})</>
                )}
              </Button>
            )}
          </div>
        </div>
        {completedCount > 0 && (
          <div className="mt-2 flex sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="ml-auto text-muted-foreground text-xs h-auto py-1 px-0"
            >
              {showCompleted ? (
                <><EyeOff className="h-3.5 w-3.5 mr-1" /> Hide completed</>
              ) : (
                <><Eye className="h-3.5 w-3.5 mr-1" /> Show completed ({completedCount})</>
              )}
            </Button>
          </div>
        )}
      </div>

      {isAddTaskOpen && (
        <div className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
            <Input
              placeholder="Add a task..."
              value={newTaskTitle}
              onChange={(e) => {
                setNewTaskTitle(e.target.value);
                if (formError) setFormError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={createTask.isPending || projects.length === 0}
            />
            <Popover open={isProjectDropdownOpen} onOpenChange={setIsProjectDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isProjectDropdownOpen}
                  className="w-full justify-between font-normal"
                  disabled={createTask.isPending || projects.length === 0}
                >
                  <span className="truncate">
                    {selectedProject
                      ? (selectedProject.icon ? `${selectedProject.icon} ${selectedProject.project_name}` : selectedProject.project_name)
                      : 'Select project'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder="Search projects..." />
                  <CommandList>
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      {projects.map((project) => {
                        const label = project.icon ? `${project.icon} ${project.project_name}` : project.project_name;
                        return (
                          <CommandItem
                            key={project.id}
                            value={label}
                            onSelect={() => {
                              setSelectedProjectId(project.id);
                              setIsProjectDropdownOpen(false);
                              if (formError) setFormError(null);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedProjectId === project.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              onClick={handleAddTask}
              disabled={createTask.isPending || projects.length === 0}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formError && (
            <p className="mt-2 text-xs text-destructive">{formError}</p>
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tasks yet. Add one above.
        </p>
      ) : grouped.size === 0 ? (
        <p className="text-muted-foreground text-sm">
          All tasks are completed.
        </p>
      ) : (
        <div className="space-y-6">
          {sortedProjectGroups.map(([projectId, group]) => {
            const project = projectMap.get(projectId);
            return (
              <ProjectTaskGroup
                key={projectId}
                project={project}
                projectId={projectId}
                tasks={group.visibleTasks}
                totalCount={group.totalCount}
                completedCount={group.completedCount}
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
  totalCount,
  completedCount,
  updateTask,
  deleteTask,
}: {
  project: Project | undefined;
  projectId: string;
  tasks: Task[];
  totalCount: number;
  completedCount: number;
  updateTask: ReturnType<typeof useUpdateTask>;
  deleteTask: ReturnType<typeof useDeleteTaskWithUndo>['deleteTask'];
}) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const updateTaskCompletion = (task: Task, nextCompleted: boolean, withUndo: boolean) => {
    updateTask.mutate(
      { id: task.id, projectId, completed: nextCompleted },
      {
        onSuccess: () => {
          const toastId = `task-complete-${task.id}`;
          toast.success(nextCompleted ? `Completed "${task.title}"` : `Reopened "${task.title}"`, {
            id: toastId,
            action: withUndo
              ? {
                  label: 'Undo',
                  onClick: () => {
                    updateTaskCompletion(task, !nextCompleted, false);
                  },
                }
              : undefined,
          });
        },
        onError: () => {
          toast.error('Failed to update task');
        },
      },
    );
  };

  const handleToggleTask = (task: Task) => {
    updateTaskCompletion(task, !task.completed, true);
  };

  const startEditingTask = (task: Task) => {
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
        onError: () => {
          toast.error('Failed to update task');
        },
      },
    );
  };

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
          {completedCount}/{totalCount} done
        </span>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="group flex items-center gap-3">
            <Checkbox
              checked={task.completed}
              disabled={editingTaskId === task.id}
              onCheckedChange={() => handleToggleTask(task)}
            />
            {editingTaskId === task.id ? (
              <>
                <Input
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  className="h-8 flex-1 text-sm"
                  autoFocus
                  disabled={updateTask.isPending}
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
                  disabled={updateTask.isPending || !editingTaskTitle.trim()}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEditingTask}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Cancel editing "${task.title}"`}
                  disabled={updateTask.isPending}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span
                  className={cn(
                    'flex-1 text-sm',
                    task.completed && 'line-through text-muted-foreground',
                  )}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => startEditingTask(task)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  aria-label={`Edit "${task.title}"`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteTask(task)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  aria-label={`Delete "${task.title}"`}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
