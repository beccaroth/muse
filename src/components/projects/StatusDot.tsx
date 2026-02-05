import { STATUS_DOT_COLORS } from '@/lib/constants';
import type { ProjectStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full shadow-[0_0_4px_currentColor]',
        STATUS_DOT_COLORS[status],
        className
      )}
    />
  );
}
