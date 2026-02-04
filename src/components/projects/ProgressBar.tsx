import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  current: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max, current, className, showLabel = false }: ProgressBarProps) {
  const percentage = max > value ? Math.round(((current - value) / (max - value)) * 100) : 0;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            clampedPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground min-w-[3ch]">{clampedPercentage}%</span>
      )}
    </div>
  );
}
