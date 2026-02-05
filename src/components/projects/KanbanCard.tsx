import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { StatusDot } from './StatusDot';
import { useViewStore } from '@/stores/viewStore';
import { getTypeColor } from '@/lib/constants';
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
          'group relative cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5',
          isDragging && 'opacity-50 shadow-xl shadow-primary/20 scale-[1.02]'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            setEditingProject(project.id);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            <h4 className="font-medium text-sm line-clamp-2 flex items-center gap-1.5">
              {project.icon && <span>{project.icon}</span>}
              <Link
                to="/project/$projectId"
                params={{ projectId: project.id }}
                className="hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {project.project_name}
              </Link>
            </h4>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <StatusDot status={project.status} />
                {project.status}
              </span>
              {project.project_types.slice(0, 2).map((type) => (
                <Badge key={type} variant="outline" className={cn('text-xs', getTypeColor(type))}>
                  {type}
                </Badge>
              ))}
              {project.project_types.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{project.project_types.length - 2}
                </Badge>
              )}
            </div>
            <ProgressBar progress={project.progress} showLabel />
          </div>
        </CardContent>
    </Card>
  );
}
