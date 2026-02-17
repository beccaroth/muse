import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { STATUS_DOT_COLORS } from '@/lib/constants';
import type { ProjectStatus } from '@/lib/constants';
import type { Project } from '@/types';
import type { CalendarTask } from '@/hooks/useCalendarData';

interface ProjectEventProps {
  project: Project;
  compact?: boolean;
  onClick?: () => void;
}

export function ProjectEvent({ project, compact, onClick }: ProjectEventProps) {
  const dotColor = STATUS_DOT_COLORS[project.status as ProjectStatus] ?? 'bg-gray-400';

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 w-full min-w-0 rounded px-1 py-0.5 text-[10px] leading-tight font-medium bg-primary/8 text-primary hover:bg-primary/15 transition-colors truncate cursor-pointer"
      >
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full shrink-0',
            dotColor,
          )}
        />
        <span className="truncate">
          {project.icon && <span className="mr-0.5">{project.icon}</span>}
          {project.project_name}
        </span>
      </button>
    );
  }

  return (
    <Link
      to="/project/$projectId"
      params={{ projectId: project.id }}
      className="flex items-center gap-1.5 w-full min-w-0 rounded-md px-2 py-1 text-xs font-medium bg-primary/8 text-primary hover:bg-primary/15 transition-colors group"
    >
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full shrink-0 shadow-[0_0_4px_currentColor]',
          dotColor,
        )}
      />
      {project.icon && <span className="shrink-0">{project.icon}</span>}
      <span className="truncate">{project.project_name}</span>
      {project.progress > 0 && (
        <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
          {project.progress}%
        </span>
      )}
    </Link>
  );
}

interface TaskEventProps {
  task: CalendarTask;
  compact?: boolean;
  onClick?: () => void;
}

export function TaskEvent({ task, compact, onClick }: TaskEventProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-1 w-full min-w-0 rounded px-1 py-0.5 text-[10px] leading-tight font-medium transition-colors truncate cursor-pointer',
          task.completed
            ? 'bg-muted/60 text-muted-foreground line-through'
            : 'bg-accent/60 text-accent-foreground hover:bg-accent/80',
        )}
      >
        <span className={cn(
          'inline-block h-1.5 w-1.5 rounded-sm shrink-0 border',
          task.completed ? 'bg-muted-foreground/30 border-muted-foreground/30' : 'border-accent-foreground/40',
        )} />
        <span className="truncate">{task.title}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 w-full min-w-0 rounded-md px-2 py-1 text-xs font-medium transition-colors group cursor-pointer text-left',
        task.completed
          ? 'bg-muted/60 text-muted-foreground line-through'
          : 'bg-accent/60 text-accent-foreground hover:bg-accent/80',
      )}
    >
      <span className={cn(
        'inline-block h-2 w-2 rounded-sm shrink-0 border',
        task.completed ? 'bg-muted-foreground/30 border-muted-foreground/30' : 'border-accent-foreground/40',
      )} />
      {task.project_icon && <span className="shrink-0 text-xs">{task.project_icon}</span>}
      <span className="truncate">{task.title}</span>
    </button>
  );
}
