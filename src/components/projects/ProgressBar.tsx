import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  onChange?: (value: number) => void;
}

export function ProgressBar({ progress, className, showLabel = false, onChange }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const trackRef = useRef<HTMLDivElement>(null);

  const calculateProgress = useCallback((clientX: number) => {
    if (!trackRef.current) return clampedProgress;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    return Math.max(0, Math.min(100, percentage));
  }, [clampedProgress]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onChange) return;
    onChange(calculateProgress(e.clientX));

    const handleMouseMove = (e: MouseEvent) => {
      onChange(calculateProgress(e.clientX));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onChange, calculateProgress]);

  const isInteractive = !!onChange;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        ref={trackRef}
        className={cn(
          'flex-1 h-2 bg-secondary rounded-full overflow-hidden',
          isInteractive && 'cursor-pointer'
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-100',
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
