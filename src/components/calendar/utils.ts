import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  addWeeks,
  parseISO,
  isWithinInterval,
  differenceInCalendarDays,
  format,
  isSameDay,
  isToday as isTodayFn,
} from 'date-fns';
import type { TwelveWeekCycle } from '@/types';

// ------- General calendar helpers -------

/** Get the full date range for a month grid (includes padding days from adjacent months). */
export function getMonthGridRange(date: Date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  return { start: gridStart, end: gridEnd };
}

/** Get all days for a month grid. */
export function getMonthGridDays(date: Date): Date[] {
  const { start, end } = getMonthGridRange(date);
  return eachDayOfInterval({ start, end });
}

/** Get the date range for a week containing the given date. */
export function getWeekRange(date: Date) {
  return { start: startOfWeek(date), end: endOfWeek(date) };
}

/** Format a date range label for display. */
export function formatDateRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth && sameYear) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  if (sameYear) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

/** Convert ISO date string to Date, with null safety. */
export function safeParseISO(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  return parseISO(dateStr);
}

export { isSameDay, isTodayFn as isToday, format, parseISO, addDays, addWeeks };

// ------- 12 Week Year helpers -------

const CYCLE_WEEKS = 12;
const CYCLE_DAYS = CYCLE_WEEKS * 7; // 84 days total

/** Calculate end date for a 12-week cycle given a start date. */
export function calculateCycleEndDate(startDate: Date): Date {
  return addDays(startDate, CYCLE_DAYS - 1);
}

/** Get the current week number (1–13) within a cycle. Returns null if outside cycle + buffer. */
export function getCycleWeekNumber(date: Date, cycle: TwelveWeekCycle): number | null {
  const cycleStart = parseISO(cycle.start_date);
  const cycleEnd = parseISO(cycle.end_date);
  const bufferEnd = addWeeks(cycleEnd, 1);

  if (date < cycleStart || date > bufferEnd) return null;
  const daysDiff = differenceInCalendarDays(date, cycleStart);
  return Math.floor(daysDiff / 7) + 1;
}

/** Get the date range for a specific week number (1–13) within a cycle. */
export function getCycleWeekRange(weekNumber: number, cycle: TwelveWeekCycle) {
  const cycleStart = parseISO(cycle.start_date);
  const weekStart = addWeeks(cycleStart, weekNumber - 1);
  const weekEnd = addDays(weekStart, 6);
  return { start: weekStart, end: weekEnd };
}

/** Calculate cycle progress as a percentage (0–100). */
export function getCycleProgress(cycle: TwelveWeekCycle): number {
  const now = new Date();
  const start = parseISO(cycle.start_date);
  const end = parseISO(cycle.end_date);
  if (now < start) return 0;
  if (now > end) return 100;
  const totalDays = differenceInCalendarDays(end, start);
  const elapsedDays = differenceInCalendarDays(now, start);
  if (totalDays === 0) return 100;
  return Math.round((elapsedDays / totalDays) * 100);
}

/** Check if a date falls within a cycle (including buffer week 13). */
export function isDateInCycle(date: Date, cycle: TwelveWeekCycle): boolean {
  const cycleStart = parseISO(cycle.start_date);
  const bufferEnd = addDays(parseISO(cycle.end_date), 7);
  return isWithinInterval(date, { start: cycleStart, end: bufferEnd });
}

// ------- Calendar event positioning helpers -------

/** Calculate the column span for a project bar in the month grid. */
export function getProjectBarSpan(
  projectStart: Date | null,
  projectEnd: Date | null,
  gridStart: Date,
  gridEnd: Date,
): { startCol: number; endCol: number } | null {
  if (!projectStart && !projectEnd) return null;

  const effectiveStart = projectStart ?? projectEnd!;
  const effectiveEnd = projectEnd ?? projectStart!;

  // No overlap with grid
  if (effectiveEnd < gridStart || effectiveStart > gridEnd) return null;

  const clampedStart = effectiveStart < gridStart ? gridStart : effectiveStart;
  const clampedEnd = effectiveEnd > gridEnd ? gridEnd : effectiveEnd;

  const startCol = differenceInCalendarDays(clampedStart, gridStart);
  const endCol = differenceInCalendarDays(clampedEnd, gridStart) + 1;

  return { startCol, endCol };
}
