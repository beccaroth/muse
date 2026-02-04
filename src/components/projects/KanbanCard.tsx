import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { STATUS_COLORS, TYPE_COLORS } from '@/lib/constants';
import { useViewStore } from '@/stores/viewStore';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  project: Project;
  isDragging?: boolean;
}

export function KanbanCard({ project, isDragging }: KanbanCardProps) {
  const { setEditingProject } = useViewStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={() => setEditingProject(project.id)}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <h4 className="font-medium text-sm line-clamp-2">{project.project_name}</h4>
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[project.status])}>
              {project.status}
            </Badge>
            {project.project_types.slice(0, 2).map((type) => (
              <Badge key={type} variant="outline" className={cn('text-xs', TYPE_COLORS[type])}>
                {type}
              </Badge>
            ))}
            {project.project_types.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{project.project_types.length - 2}
              </Badge>
            )}
          </div>
          <ProgressBar
            value={project.start_value}
            max={project.end_value}
            current={project.current_value}
            showLabel
          />
        </div>
      </CardContent>
    </Card>
  );
}
