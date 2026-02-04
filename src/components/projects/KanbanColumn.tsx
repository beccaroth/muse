import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { PRIORITY_COLORS } from '@/lib/constants';
import type { Project } from '@/types';
import type { ProjectPriority } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  priority: ProjectPriority;
  projects: Project[];
}

export function KanbanColumn({ priority, projects }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg bg-muted/50 p-3 min-h-[300px] transition-colors',
        isOver && 'bg-muted'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-3 h-3 rounded-full', PRIORITY_COLORS[priority])} />
        <h3 className="font-medium text-sm">{priority}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{projects.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            No projects
          </div>
        ) : (
          projects.map((project) => <KanbanCard key={project.id} project={project} />)
        )}
      </div>
    </div>
  );
}
