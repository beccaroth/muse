import { useMemo } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCycleWeekRange, getCycleWeekNumber } from './utils';
import { TwelveWeekHeader } from './TwelveWeekHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TwelveWeekCycle, Project } from '@/types';
import type { CalendarTask } from '@/hooks/useCalendarData';

interface TwelveWeekViewProps {
  cycles: TwelveWeekCycle[];
  activeCycleId: string | null;
  onSelectCycle: (id: string) => void;
  projects: Project[];
  tasks: CalendarTask[];
  showProjects: boolean;
  showTasks: boolean;
  onWeekClick?: (weekStart: Date) => void;
}

export function TwelveWeekView({
  cycles,
  activeCycleId,
  onSelectCycle,
  projects,
  tasks,
  showProjects,
  showTasks,
  onWeekClick,
}: TwelveWeekViewProps) {
  const activeCycle = cycles.find((c) => c.id === activeCycleId) ?? cycles[0];

  if (!activeCycle) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No 12-week cycles yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cycles.length > 1 && (
        <Select value={activeCycle.id} onValueChange={onSelectCycle}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                {cycle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <TwelveWeekHeader cycle={activeCycle} />

      <div className="space-y-1">
        {Array.from({ length: 13 }, (_, i) => i + 1).map((weekNum) => (
          <WeekRow
            key={weekNum}
            weekNumber={weekNum}
            cycle={activeCycle}
            projects={projects}
            tasks={tasks}
            showProjects={showProjects}
            showTasks={showTasks}
            onWeekClick={onWeekClick}
          />
        ))}
      </div>
    </div>
  );
}

function WeekRow({
  weekNumber,
  cycle,
  projects,
  tasks,
  showProjects,
  showTasks,
  onWeekClick,
}: {
  weekNumber: number;
  cycle: TwelveWeekCycle;
  projects: Project[];
  tasks: CalendarTask[];
  showProjects: boolean;
  showTasks: boolean;
  onWeekClick?: (weekStart: Date) => void;
}) {
  const isBufferWeek = weekNumber === 13;
  const currentWeek = getCycleWeekNumber(new Date(), cycle);
  const isCurrent = currentWeek === weekNumber;
  const isPast = currentWeek !== null && weekNumber < currentWeek;

  const { start, end } = getCycleWeekRange(weekNumber, cycle);
  const dateRange = `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;

  // Count events in this week
  const weekProjects = useMemo(() => {
    if (!showProjects) return [];
    return projects.filter((p) => {
      const pStart = p.start_date ? new Date(p.start_date) : null;
      const pEnd = p.end_date ? new Date(p.end_date) : null;
      if (!pStart && !pEnd) return false;
      const effectiveStart = pStart ?? pEnd!;
      const effectiveEnd = pEnd ?? pStart!;
      // Check if project overlaps with this week
      return effectiveStart <= end && effectiveEnd >= start;
    });
  }, [projects, start, end, showProjects]);

  const weekTasks = useMemo(() => {
    if (!showTasks) return [];
    const days = eachDayOfInterval({ start, end });
    const dayStrs = new Set(days.map((d) => format(d, 'yyyy-MM-dd')));
    return tasks.filter((t) => t.due_date && dayStrs.has(t.due_date));
  }, [tasks, start, end, showTasks]);

  const completedTasks = weekTasks.filter((t) => t.completed).length;
  const totalTasks = weekTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : null;

  return (
    <button
      onClick={() => onWeekClick?.(start)}
      className={cn(
        'w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all text-left',
        'hover:bg-muted/50 hover:border-border',
        isBufferWeek && 'border-dashed bg-muted/20',
        isCurrent && 'border-primary/30 bg-primary/[0.04] ring-1 ring-primary/20',
        isPast && !isCurrent && 'opacity-60',
        !isCurrent && !isBufferWeek && 'border-border/50 bg-card',
      )}
    >
      {/* Week number */}
      <div className={cn(
        'shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-bold',
        isCurrent && 'bg-primary text-primary-foreground',
        isBufferWeek && !isCurrent && 'bg-muted text-muted-foreground',
        !isCurrent && !isBufferWeek && 'bg-muted/80 text-muted-foreground',
      )}>
        {weekNumber}
      </div>

      {/* Date range */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium',
            isBufferWeek && 'text-muted-foreground',
          )}>
            {isBufferWeek ? 'Buffer Week' : `Week ${weekNumber}`}
          </span>
          {isCurrent && (
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              Current
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{dateRange}</span>
      </div>

      {/* Event indicators */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {weekProjects.length > 0 && (
          <span className="text-[10px] text-muted-foreground bg-primary/8 text-primary rounded px-1.5 py-0.5 font-medium">
            {weekProjects.length} project{weekProjects.length !== 1 ? 's' : ''}
          </span>
        )}
        {totalTasks > 0 && (
          <span className="text-[10px] text-muted-foreground bg-accent/60 rounded px-1.5 py-0.5 font-medium">
            {completedTasks}/{totalTasks} tasks
          </span>
        )}
      </div>

      {/* Completion */}
      {completionPct !== null && (
        <div className="shrink-0 text-right">
          <span className={cn(
            'text-sm font-semibold tabular-nums',
            completionPct === 100 && 'text-green-500',
          )}>
            {completionPct}%
          </span>
        </div>
      )}
    </button>
  );
}
