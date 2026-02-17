import { useState, useMemo, useCallback } from 'react';
import { parseISO, format, addDays } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useViewStore } from '@/stores/viewStore';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useTwelveWeekCycles, useCreateCycle } from '@/hooks/useTwelveWeekCycles';
import { useUpdateTask } from '@/hooks/useTasks';
import { Loading } from '@/components/ui/loading';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { TwelveWeekView } from './TwelveWeekView';
import { CycleForm } from './CycleForm';
import { getMonthGridRange, getWeekRange } from './utils';
import type { CalendarView } from '@/stores/viewStore';
import type { CalendarTask } from '@/hooks/useCalendarData';

export function CalendarPage() {
  const {
    calendarView,
    setCalendarView,
    calendarDate,
    setCalendarDate,
    calendarShowProjects,
    setCalendarShowProjects,
    calendarShowTasks,
    setCalendarShowTasks,
  } = useViewStore();

  const [cycleFormOpen, setCycleFormOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  const currentDate = useMemo(() => parseISO(calendarDate), [calendarDate]);

  // Calculate date range based on view
  const { startDate, endDate } = useMemo(() => {
    if (calendarView === 'month') {
      const { start, end } = getMonthGridRange(currentDate);
      return {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      };
    }
    if (calendarView === 'week') {
      const { start, end } = getWeekRange(currentDate);
      return {
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      };
    }
    // For twelve-week view, use a wide range to cover the full cycle
    const wideStart = format(addDays(currentDate, -120), 'yyyy-MM-dd');
    const wideEnd = format(addDays(currentDate, 120), 'yyyy-MM-dd');
    return { startDate: wideStart, endDate: wideEnd };
  }, [calendarView, currentDate]);

  const { data: calendarData, isLoading: calendarLoading } = useCalendarData(startDate, endDate);
  const { data: cycles = [] } = useTwelveWeekCycles();
  const createCycle = useCreateCycle();
  const updateTask = useUpdateTask();

  const hasCycles = cycles.length > 0;
  const activeCycle = cycles.find((c) => c.is_active) ?? cycles[0] ?? null;

  const handleDateChange = useCallback((date: Date) => {
    setCalendarDate(format(date, 'yyyy-MM-dd'));
  }, [setCalendarDate]);

  const handleViewChange = useCallback((view: CalendarView) => {
    setCalendarView(view);
  }, [setCalendarView]);

  const handleToggleTaskComplete = useCallback((task: CalendarTask) => {
    updateTask.mutate({
      id: task.id,
      projectId: task.project_id,
      completed: !task.completed,
    });
  }, [updateTask]);

  const handleDayClick = useCallback((date: Date) => {
    setCalendarDate(format(date, 'yyyy-MM-dd'));
    setCalendarView('week');
  }, [setCalendarDate, setCalendarView]);

  const handleWeekClick = useCallback((weekStart: Date) => {
    setCalendarDate(format(weekStart, 'yyyy-MM-dd'));
    setCalendarView('week');
  }, [setCalendarDate, setCalendarView]);

  const handleCreateCycle = useCallback(
    (data: { name: string; start_date: string; end_date: string; goal: string | null; is_active: boolean }) => {
      createCycle.mutate(data, {
        onSuccess: () => setCycleFormOpen(false),
      });
    },
    [createCycle],
  );

  const projects = calendarData?.projects ?? [];
  const tasks = calendarData?.tasks ?? [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">Calendar</h1>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        view={calendarView}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        showProjects={calendarShowProjects}
        onShowProjectsChange={setCalendarShowProjects}
        showTasks={calendarShowTasks}
        onShowTasksChange={setCalendarShowTasks}
        hasCycles={hasCycles}
        onNewCycle={() => setCycleFormOpen(true)}
      />

      <div className="mt-4">
        {calendarLoading ? (
          <Loading className="py-20" />
        ) : calendarView === 'month' ? (
          <MonthView
            currentDate={currentDate}
            projects={projects}
            tasks={tasks}
            showProjects={calendarShowProjects}
            showTasks={calendarShowTasks}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDayClick={handleDayClick}
          />
        ) : calendarView === 'week' ? (
          <WeekView
            currentDate={currentDate}
            projects={projects}
            tasks={tasks}
            showProjects={calendarShowProjects}
            showTasks={calendarShowTasks}
            activeCycle={activeCycle}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        ) : (
          <TwelveWeekView
            cycles={cycles}
            activeCycleId={selectedCycleId ?? activeCycle?.id ?? null}
            onSelectCycle={setSelectedCycleId}
            projects={projects}
            tasks={tasks}
            showProjects={calendarShowProjects}
            showTasks={calendarShowTasks}
            onWeekClick={handleWeekClick}
          />
        )}
      </div>

      <CycleForm
        open={cycleFormOpen}
        onOpenChange={setCycleFormOpen}
        onSubmit={handleCreateCycle}
        isPending={createCycle.isPending}
      />
    </main>
  );
}
