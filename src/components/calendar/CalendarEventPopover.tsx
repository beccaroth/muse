import { Link } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/projects/StatusDot';
import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';
import type { ProjectStatus } from '@/lib/constants';
import type { Project } from '@/types';
import type { CalendarTask } from '@/hooks/useCalendarData';

interface ProjectPopoverProps {
  project: Project;
  children: React.ReactNode;
}

export function ProjectPopover({ project, children }: ProjectPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 space-y-2.5">
          <div className="flex items-start gap-2">
            {project.icon && (
              <span className="text-lg leading-none mt-0.5">{project.icon}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">
                {project.project_name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusDot status={project.status as ProjectStatus} />
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] h-4 px-1.5',
                    STATUS_COLORS[project.status as ProjectStatus],
                  )}
                >
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>

          {(project.start_date || project.end_date) && (
            <div className="text-xs text-muted-foreground">
              {project.start_date && (
                <span>{format(parseISO(project.start_date), 'MMM d, yyyy')}</span>
              )}
              {project.start_date && project.end_date && <span> — </span>}
              {project.end_date && (
                <span>{format(parseISO(project.end_date), 'MMM d, yyyy')}</span>
              )}
            </div>
          )}

          {project.progress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    project.progress === 100
                      ? 'bg-green-500'
                      : 'bg-primary',
                  )}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}

          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
            <Link to="/project/$projectId" params={{ projectId: project.id }}>
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Go to project
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TaskPopoverProps {
  task: CalendarTask;
  onToggleComplete?: () => void;
  children: React.ReactNode;
}

export function TaskPopover({ task, onToggleComplete, children }: TaskPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 space-y-2.5">
          <div className="flex items-start gap-2">
            <button
              onClick={onToggleComplete}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn(
                'font-medium text-sm',
                task.completed && 'line-through text-muted-foreground',
              )}>
                {task.title}
              </p>
              {task.project_name && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  {task.project_icon && <span>{task.project_icon}</span>}
                  {task.project_name}
                </p>
              )}
            </div>
          </div>

          {task.due_date && (
            <p className="text-xs text-muted-foreground">
              Due {format(parseISO(task.due_date), 'MMM d, yyyy')}
            </p>
          )}

          {task.project_id && (
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7" asChild>
              <Link to="/project/$projectId" params={{ projectId: task.project_id }}>
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Go to project
              </Link>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
