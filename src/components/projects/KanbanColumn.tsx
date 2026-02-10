import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { PRIORITY_COLORS, STATUS_DOT_COLORS } from '@/lib/constants';
import type { Project } from '@/types';
import type { ProjectPriority, ProjectStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  projects: Project[];
  colorType: 'priority' | 'status';
  kanbanGroupBy: 'priority' | 'status';
}

export function KanbanColumn({ id, title, projects, colorType, kanbanGroupBy }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getDotColor = () => {
    if (colorType === 'priority') {
      return PRIORITY_COLORS[title as ProjectPriority] || 'bg-gray-500';
    }
    return STATUS_DOT_COLORS[title as ProjectStatus] || 'bg-gray-500';
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg bg-muted/50 p-3 min-h-[150px] sm:min-h-[300px] transition-colors',
        isOver && 'bg-muted'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-3 h-3 rounded-full', getDotColor())} />
        <h3 className="font-medium text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{projects.length}</span>
      </div>
      <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
              No projects
            </div>
          ) : (
            projects.map((project) => <KanbanCard key={project.id} project={project} kanbanGroupBy={kanbanGroupBy} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
