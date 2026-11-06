import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { SHELF_CARD_SIZE } from '@/lib/constants';
import type { ProjectPriority } from '@/lib/constants';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

function shelfGridClass(priority: ProjectPriority, count: number) {
  if (priority === 'Now') {
    // A lone Now project takes the whole shelf; more than that share it.
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 @3xl:grid-cols-2';
    return 'grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-3';
  }
  // A full row stretches to fill the width, for instance when the Seeds rail is hidden.
  // One or two cards keep their normal size instead of ballooning across the page.
  if (priority === 'Next') {
    return count >= 3
      ? 'grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))]'
      : 'grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))]';
  }
  return count >= 3
    ? 'grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))]'
    : 'grid-cols-[repeat(auto-fill,minmax(min(100%,12rem),1fr))]';
}

interface KanbanShelfProps {
  priority: ProjectPriority;
  projects: Project[];
}

export function KanbanShelf({ priority, projects }: KanbanShelfProps) {
  const { setNodeRef, isOver } = useDroppable({ id: priority });

  return (
    <section
      ref={setNodeRef}
      aria-label={priority}
      // The negative margin lets the drop highlight bleed past the cards without shifting
      // them out of line with the rest of the page.
      className={cn('-mx-2 rounded-2xl p-2 transition-colors', isOver && 'bg-muted')}
    >
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="font-display text-lg font-semibold tracking-tight">{priority}</h3>
        <span className="text-sm tabular-nums text-muted-foreground">{projects.length}</span>
      </div>
      <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
        {projects.length === 0 ? (
          <div className="flex h-20 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No projects here yet
          </div>
        ) : (
          <div className={cn('grid gap-3', shelfGridClass(priority, projects.length))}>
            {projects.map((project) => (
              <KanbanCard
                key={project.id}
                project={project}
                size={SHELF_CARD_SIZE[priority]}
                kanbanGroupBy="priority"
              />
            ))}
          </div>
        )}
      </SortableContext>
    </section>
  );
}
