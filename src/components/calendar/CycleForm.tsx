import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { calculateCycleEndDate } from './utils';
import type { TwelveWeekCycle } from '@/types';

const cycleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  goal: z.string().optional(),
});

type CycleFormValues = z.infer<typeof cycleSchema>;

interface CycleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; start_date: string; end_date: string; goal: string | null; is_active: boolean }) => void;
  editingCycle?: TwelveWeekCycle | null;
  isPending?: boolean;
}

export function CycleForm({ open, onOpenChange, onSubmit, editingCycle, isPending }: CycleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      name: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      goal: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingCycle) {
        reset({
          name: editingCycle.name,
          start_date: editingCycle.start_date,
          goal: editingCycle.goal ?? '',
        });
      } else {
        reset({
          name: '',
          start_date: format(new Date(), 'yyyy-MM-dd'),
          goal: '',
        });
      }
    }
  }, [open, editingCycle, reset]);

  const startDate = watch('start_date');
  const endDate = startDate
    ? format(calculateCycleEndDate(new Date(startDate + 'T00:00:00')), 'yyyy-MM-dd')
    : '';
  const endDateDisplay = startDate
    ? format(calculateCycleEndDate(new Date(startDate + 'T00:00:00')), 'MMM d, yyyy')
    : '—';

  const handleFormSubmit = (data: CycleFormValues) => {
    onSubmit({
      name: data.name,
      start_date: data.start_date,
      end_date: endDate,
      goal: data.goal?.trim() || null,
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCycle ? 'Edit cycle' : 'New 12-week cycle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cycle-name">Name</Label>
            <Input
              id="cycle-name"
              placeholder="e.g. Spring Sprint, Q2 Focus"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cycle-start">Start date</Label>
              <Input
                id="cycle-start"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <div className="h-9 px-3 flex items-center rounded-md border bg-muted/50 text-sm text-muted-foreground">
                {endDateDisplay}
              </div>
              <p className="text-[10px] text-muted-foreground">Auto-calculated (12 weeks)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle-goal">Goal (optional)</Label>
            <Textarea
              id="cycle-goal"
              placeholder="What do you want to accomplish in this cycle?"
              rows={2}
              {...register('goal')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingCycle ? 'Save changes' : 'Create cycle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
