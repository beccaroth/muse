import { addMonths, addWeeks, format } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  ListChecks,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CalendarView } from '@/stores/viewStore';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  showProjects: boolean;
  onShowProjectsChange: (show: boolean) => void;
  showTasks: boolean;
  onShowTasksChange: (show: boolean) => void;
  hasCycles: boolean;
  onNewCycle: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  showProjects,
  onShowProjectsChange,
  showTasks,
  onShowTasksChange,
  hasCycles,
  onNewCycle,
}: CalendarHeaderProps) {
  const handlePrev = () => {
    if (view === 'month') {
      onDateChange(addMonths(currentDate, -1));
    } else {
      onDateChange(addWeeks(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      onDateChange(addMonths(currentDate, 1));
    } else {
      onDateChange(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const periodLabel =
    view === 'month'
      ? format(currentDate, 'MMMM yyyy')
      : view === 'week'
        ? `Week of ${format(currentDate, 'MMM d, yyyy')}`
        : '12 Week Year';

  const viewOptions: { value: CalendarView; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    ...(hasCycles ? [{ value: 'twelveWeek' as CalendarView, label: '12 Week' }] : []),
  ];

  return (
    <div className="space-y-3">
      {/* Main header row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs h-8"
          >
            Today
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap">
            {periodLabel}
          </h2>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Desktop view toggle */}
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && onViewChange(v as CalendarView)}
            className="hidden sm:flex"
          >
            {viewOptions.map(({ value, label }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                size="sm"
                className="text-xs h-8 px-3"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Mobile view select */}
          <Select
            value={view}
            onValueChange={(v) => onViewChange(v as CalendarView)}
          >
            <SelectTrigger className="sm:hidden h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onNewCycle}
            className="text-xs h-8 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cycle</span>
          </Button>
        </div>
      </div>

      {/* Filter row */}
      {view !== 'twelveWeek' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="show-projects"
              checked={showProjects}
              onCheckedChange={(checked) => onShowProjectsChange(checked === true)}
            />
            <Label htmlFor="show-projects" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Projects
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="show-tasks"
              checked={showTasks}
              onCheckedChange={(checked) => onShowTasksChange(checked === true)}
            />
            <Label htmlFor="show-tasks" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              Tasks
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
