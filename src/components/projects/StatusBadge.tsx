import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, TYPE_COLORS } from '@/lib/constants';
import type { ProjectStatus, ProjectType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[status])}>
      {status}
    </Badge>
  );
}

interface TypeBadgeProps {
  type: ProjectType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn('text-xs', TYPE_COLORS[type])}>
      {type}
    </Badge>
  );
}
