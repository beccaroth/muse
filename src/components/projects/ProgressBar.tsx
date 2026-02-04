import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, className, showLabel = false }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            clampedProgress === 100 ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground min-w-[3ch]">{clampedProgress}%</span>
      )}
    </div>
  );
}
