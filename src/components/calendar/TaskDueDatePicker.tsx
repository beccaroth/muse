import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskDueDatePickerProps {
  dueDate: string | null;
  onDateChange: (date: string | null) => void;
  compact?: boolean;
}

export function TaskDueDatePicker({ dueDate, onDateChange, compact }: TaskDueDatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = dueDate ? parseISO(dueDate) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(format(date, 'yyyy-MM-dd'));
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(null);
    setOpen(false);
  };

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 transition-colors',
              dueDate
                ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50',
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {dueDate ? format(parseISO(dueDate), 'MMM d') : null}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
          />
          {dueDate && (
            <div className="border-t px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-destructive hover:text-destructive h-7"
                onClick={handleClear}
              >
                <X className="h-3 w-3 mr-1" />
                Remove due date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-7 text-xs gap-1.5',
            !dueDate && 'text-muted-foreground',
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {dueDate ? format(parseISO(dueDate), 'MMM d, yyyy') : 'Set due date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
        {dueDate && (
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-destructive hover:text-destructive h-7"
              onClick={handleClear}
            >
              <X className="h-3 w-3 mr-1" />
              Remove due date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
