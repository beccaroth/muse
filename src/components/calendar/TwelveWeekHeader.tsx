import { format, parseISO } from 'date-fns';
import { Target, Calendar as CalendarIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getCycleProgress, getCycleWeekNumber } from './utils';
import type { TwelveWeekCycle } from '@/types';

interface TwelveWeekHeaderProps {
  cycle: TwelveWeekCycle;
}

export function TwelveWeekHeader({ cycle }: TwelveWeekHeaderProps) {
  const progress = getCycleProgress(cycle);
  const currentWeek = getCycleWeekNumber(new Date(), cycle);
  const isActive = currentWeek !== null && currentWeek <= 12;

  return (
    <div className="bg-card rounded-lg border p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base truncate">{cycle.name}</h2>
            {isActive && (
              <span className="shrink-0 inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 font-semibold text-[11px]">
                Week {currentWeek}
              </span>
            )}
            {currentWeek === 13 && (
              <span className="shrink-0 inline-flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 font-medium text-[11px]">
                Buffer week
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {format(parseISO(cycle.start_date), 'MMM d')} — {format(parseISO(cycle.end_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold tabular-nums">{progress}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">complete</p>
        </div>
      </div>

      {cycle.goal && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          <Target className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>{cycle.goal}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Week 1</span>
          <span>Week 12</span>
        </div>
      </div>
    </div>
  );
}
