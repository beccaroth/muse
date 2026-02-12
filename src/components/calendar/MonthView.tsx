import { useMemo } from 'react';
import { startOfMonth } from 'date-fns';
import { getMonthGridDays } from './utils';
import { MonthViewDay } from './MonthViewDay';
import type { Project } from '@/types';
import type { CalendarTask } from '@/hooks/useCalendarData';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthViewProps {
  currentDate: Date;
  projects: Project[];
  tasks: CalendarTask[];
  showProjects: boolean;
  showTasks: boolean;
  onToggleTaskComplete?: (task: CalendarTask) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthView({
  currentDate,
  projects,
  tasks,
  showProjects,
  showTasks,
  onToggleTaskComplete,
  onDayClick,
}: MonthViewProps) {
  const days = useMemo(() => getMonthGridDays(currentDate), [currentDate]);
  const monthStart = startOfMonth(currentDate);

  // Group days into weeks for the grid
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7">
          {week.map((day) => (
            <MonthViewDay
              key={day.toISOString()}
              date={day}
              currentMonth={monthStart}
              projects={projects}
              tasks={tasks}
              showProjects={showProjects}
              showTasks={showTasks}
              onToggleTaskComplete={onToggleTaskComplete}
              onDayClick={onDayClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
