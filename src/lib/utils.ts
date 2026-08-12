import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a Postgres DATE value ('YYYY-MM-DD') as local midnight.
 *
 * `new Date('2026-08-11')` is parsed as UTC midnight per the ECMAScript date-only
 * form, so formatting it in any negative-offset timezone renders the previous day.
 * Values that carry a time component are passed through to the normal Date parser.
 */
export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return new Date(value)

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/**
 * Next sort_order for a task list.
 *
 * Using the list length collides after any deletion (delete one of three, and the next
 * task added reuses an existing 2), which makes the ordering unstable. Take one past the
 * current maximum instead.
 */
export function nextSortOrder(tasks: { sort_order: number }[]): number {
  return tasks.reduce((max, task) => Math.max(max, task.sort_order), -1) + 1
}
