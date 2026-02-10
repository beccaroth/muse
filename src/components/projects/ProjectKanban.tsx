import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '@/lib/constants';
import { useUpdateProject } from '@/hooks/useProjects';
import { useViewStore } from '@/stores/viewStore';
import type { Project } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectPriority, ProjectStatus } from '@/lib/constants';

interface ProjectKanbanProps {
  projects: Project[];
  isLoading: boolean;
}

function sortByCardOrder(projects: Project[], order: string[] | undefined): Project[] {
  if (!order || order.length === 0) return projects;
  const indexMap = new Map(order.map((id, i) => [id, i]));
  return [...projects].sort((a, b) => {
    const ai = indexMap.get(a.id);
    const bi = indexMap.get(b.id);
    if (ai === undefined && bi === undefined) return 0;
    if (ai === undefined) return 1;
    if (bi === undefined) return -1;
    return ai - bi;
  });
}

export function ProjectKanban({ projects, isLoading }: ProjectKanbanProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const updateProject = useUpdateProject();
  const { kanbanGroupBy, showDoneColumn, kanbanCardOrder, setKanbanCardOrder } = useViewStore();

  // Configure sensors with activation constraint so clicks work
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Filter out Done projects when grouping by priority (unless showDoneColumn is true)
  const filteredProjects = kanbanGroupBy === 'priority' && !showDoneColumn
    ? projects.filter((p) => p.status !== 'Done')
    : projects;

  // Get statuses to display based on showDoneColumn setting
  const statusesToShow = showDoneColumn
    ? PROJECT_STATUSES
    : PROJECT_STATUSES.filter(s => s !== 'Done');

  const projectsByPriority = PROJECT_PRIORITIES.reduce(
    (acc, priority) => {
      acc[priority] = sortByCardOrder(
        filteredProjects.filter((p) => p.priority === priority),
        kanbanCardOrder[priority]
      );
      return acc;
    },
    {} as Record<ProjectPriority, Project[]>
  );

  const projectsByStatus = statusesToShow.reduce(
    (acc, status) => {
      acc[status] = sortByCardOrder(
        projects.filter((p) => p.status === status),
        kanbanCardOrder[status]
      );
      return acc;
    },
    {} as Record<ProjectStatus, Project[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find((p) => p.id === event.active.id);
    setActiveProject(project ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;
    const project = projects.find((p) => p.id === projectId);

    if (!project) return;

    // Determine which column the dragged card belongs to
    const sourceCol = kanbanGroupBy === 'priority' ? project.priority : project.status;
    const sourceProjects = kanbanGroupBy === 'priority'
      ? projectsByPriority[project.priority]
      : projectsByStatus[project.status];

    // Check if dropped on a card in the same column (reorder)
    const sourceIds = sourceProjects.map((p) => p.id);
    const oldIndex = sourceIds.indexOf(projectId);
    const newIndex = sourceIds.indexOf(overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      // Same-column reorder
      const newIds = arrayMove(sourceIds, oldIndex, newIndex);
      setKanbanCardOrder({ ...kanbanCardOrder, [sourceCol]: newIds });
      return;
    }

    // Cross-column move (dropped on a column or a card in another column)
    if (kanbanGroupBy === 'priority') {
      const newPriority = over.id as ProjectPriority;
      if (project.priority !== newPriority) {
        updateProject.mutate({ id: projectId, priority: newPriority });
      }
    } else {
      const newStatus = over.id as ProjectStatus;
      if (project.status !== newStatus) {
        updateProject.mutate({ id: projectId, status: newStatus });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="flex flex-col rounded-lg bg-muted/50 p-3 min-h-[300px]">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-3 w-3 rounded-full imagination-skeleton" />
              <Skeleton className="h-4 w-16 imagination-skeleton" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 - col % 2 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 imagination-skeleton" />
                  <Skeleton className="h-3 w-1/2 imagination-skeleton" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-14 rounded-full imagination-skeleton" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full imagination-skeleton" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {kanbanGroupBy === 'priority' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECT_PRIORITIES.map((priority) => (
            <KanbanColumn
              key={priority}
              id={priority}
              title={priority}
              projects={projectsByPriority[priority]}
              colorType="priority"
              kanbanGroupBy={kanbanGroupBy}
            />
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${showDoneColumn ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {statusesToShow.map((status) => (
            <KanbanColumn
              key={status}
              id={status}
              title={status}
              projects={projectsByStatus[status]}
              colorType="status"
              kanbanGroupBy={kanbanGroupBy}
            />
          ))}
        </div>
      )}
      <DragOverlay>
        {activeProject ? <KanbanCard project={activeProject} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
