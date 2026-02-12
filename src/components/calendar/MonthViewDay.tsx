import { useMemo } from 'react';
import { isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { isToday, isSameDay, format } from './utils';
import { ProjectEvent, TaskEvent } from './CalendarEvent';
import { ProjectPopover, TaskPopover } from './CalendarEventPopover';
import type { Project } from '@/types';
import type { CalendarTask } from '@/hooks/useCalendarData';

const MAX_VISIBLE_EVENTS = 3;

interface MonthViewDayProps {
  date: Date;
  currentMonth: Date;
  projects: Project[];
  tasks: CalendarTask[];
  showProjects: boolean;
  showTasks: boolean;
  onToggleTaskComplete?: (task: CalendarTask) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthViewDay({
  date,
  currentMonth,
  projects,
  tasks,
  showProjects,
  showTasks,
  onToggleTaskComplete,
  onDayClick,
}: MonthViewDayProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  const dayProjects = useMemo(() => {
    if (!showProjects) return [];
    return projects.filter((p) => {
      const start = p.start_date ? new Date(p.start_date) : null;
      const end = p.end_date ? new Date(p.end_date) : null;
      if (!start && !end) return false;
      if (start && end) return date >= start && date <= end;
      if (start) return isSameDay(date, start);
      if (end) return isSameDay(date, end);
      return false;
    });
  }, [date, projects, showProjects]);

  const dayTasks = useMemo(() => {
    if (!showTasks) return [];
    return tasks.filter((t) => t.due_date === dateStr);
  }, [tasks, dateStr, showTasks]);

  const allEvents = [
    ...dayProjects.map((p) => ({ type: 'project' as const, data: p })),
    ...dayTasks.map((t) => ({ type: 'task' as const, data: t })),
  ];
  const visibleEvents = allEvents.slice(0, MAX_VISIBLE_EVENTS);
  const overflowCount = allEvents.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      className={cn(
        'relative min-h-[5.5rem] sm:min-h-[7rem] p-1 sm:p-1.5 border-b border-r border-border/50 transition-colors',
        !isCurrentMonth && 'bg-muted/30',
        today && 'bg-primary/[0.03]',
      )}
      onClick={() => onDayClick?.(date)}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={cn(
            'text-xs font-medium leading-none inline-flex items-center justify-center',
            !isCurrentMonth && 'text-muted-foreground/50',
            isCurrentMonth && 'text-foreground',
            today &&
              'bg-primary text-primary-foreground rounded-full h-5 w-5 text-[10px] font-semibold',
          )}
        >
          {format(date, 'd')}
        </span>
      </div>

      <div className="space-y-0.5">
        {visibleEvents.map((event) => {
          if (event.type === 'project') {
            const project = event.data as Project;
            return (
              <ProjectPopover key={`p-${project.id}`} project={project}>
                <div>
                  <ProjectEvent project={project} compact />
                </div>
              </ProjectPopover>
            );
          }
          const task = event.data as CalendarTask;
          return (
            <TaskPopover
              key={`t-${task.id}`}
              task={task}
              onToggleComplete={() => onToggleTaskComplete?.(task)}
            >
              <div>
                <TaskEvent task={task} compact />
              </div>
            </TaskPopover>
          );
        })}
        {overflowCount > 0 && (
          <button
            className="text-[10px] text-muted-foreground hover:text-foreground font-medium px-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDayClick?.(date);
            }}
          >
            +{overflowCount} more
          </button>
        )}
      </div>
    </div>
  );
}
