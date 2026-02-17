import { useMemo } from 'react';
import { eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { isToday, format, getWeekRange } from './utils';
import { ProjectEvent, TaskEvent } from './CalendarEvent';
import { ProjectPopover, TaskPopover } from './CalendarEventPopover';
import type { Project } from '@/types';
import type { CalendarTask } from '@/hooks/useCalendarData';
import type { TwelveWeekCycle } from '@/types';
import { getCycleWeekNumber } from './utils';

interface WeekViewProps {
  currentDate: Date;
  projects: Project[];
  tasks: CalendarTask[];
  showProjects: boolean;
  showTasks: boolean;
  activeCycle?: TwelveWeekCycle | null;
  onToggleTaskComplete?: (task: CalendarTask) => void;
}

export function WeekView({
  currentDate,
  projects,
  tasks,
  showProjects,
  showTasks,
  activeCycle,
  onToggleTaskComplete,
}: WeekViewProps) {
  const { start, end } = getWeekRange(currentDate);
  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  const cycleWeek = activeCycle
    ? getCycleWeekNumber(currentDate, activeCycle)
    : null;

  return (
    <div className="space-y-3">
      {cycleWeek && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 font-semibold text-[11px]">
            Week {cycleWeek} of 12
          </span>
          {activeCycle && (
            <span>{activeCycle.name}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-0">
        {days.map((day) => (
          <WeekDayColumn
            key={day.toISOString()}
            date={day}
            projects={projects}
            tasks={tasks}
            showProjects={showProjects}
            showTasks={showTasks}
            onToggleTaskComplete={onToggleTaskComplete}
          />
        ))}
      </div>
    </div>
  );
}

function WeekDayColumn({
  date,
  projects,
  tasks,
  showProjects,
  showTasks,
  onToggleTaskComplete,
}: {
  date: Date;
  projects: Project[];
  tasks: CalendarTask[];
  showProjects: boolean;
  showTasks: boolean;
  onToggleTaskComplete?: (task: CalendarTask) => void;
}) {
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

  const hasEvents = dayProjects.length > 0 || dayTasks.length > 0;

  return (
    <div
      className={cn(
        'bg-card border border-border/50 sm:border-r-0 sm:last:border-r sm:first:rounded-l-lg sm:last:rounded-r-lg sm:rounded-none rounded-lg min-h-[6rem] sm:min-h-[16rem] flex flex-col',
        today && 'ring-1 ring-primary/30 sm:ring-0 sm:bg-primary/[0.03]',
      )}
    >
      {/* Day header */}
      <div className={cn(
        'px-2.5 py-2 border-b border-border/50 flex items-center gap-2 sm:flex-col sm:items-start',
      )}>
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {format(date, 'EEE')}
        </span>
        <span
          className={cn(
            'text-sm font-semibold',
            today &&
              'bg-primary text-primary-foreground rounded-full h-6 w-6 inline-flex items-center justify-center text-xs',
          )}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Events */}
      <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
        {dayProjects.map((project) => (
          <ProjectPopover key={project.id} project={project}>
            <div>
              <ProjectEvent project={project} />
            </div>
          </ProjectPopover>
        ))}
        {dayTasks.map((task) => (
          <TaskPopover
            key={task.id}
            task={task}
            onToggleComplete={() => onToggleTaskComplete?.(task)}
          >
            <div>
              <TaskEvent task={task} />
            </div>
          </TaskPopover>
        ))}
        {!hasEvents && (
          <div className="flex items-center justify-center h-full text-muted-foreground/30 text-xs">
            —
          </div>
        )}
      </div>
    </div>
  );
}
