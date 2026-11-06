import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCardOverlay } from './KanbanCard';
import { KanbanShelf } from './KanbanShelf';
import { PROJECT_PRIORITIES, PROJECT_STATUSES, SHELF_CARD_SIZE, STATUS_DOT_COLORS } from '@/lib/constants';
import { useUpdateProject } from '@/hooks/useProjects';
import { useViewStore } from '@/stores/viewStore';
import type { Project } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectPriority, ProjectStatus } from '@/lib/constants';

interface ProjectKanbanProps {
  projects: Project[];
  isLoading: boolean;
  /** Shelves always group by priority; Kanban columns follow the "Group by" filter. */
  layout: 'shelves' | 'kanban';
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

export function ProjectKanban({ projects, isLoading, layout }: ProjectKanbanProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const updateProject = useUpdateProject();
  const { kanbanGroupBy, showDoneColumn, hideOnHold, hideNotStarted, kanbanCardOrder, setKanbanCardOrder, kanbanReversed } = useViewStore();
  const groupBy = layout === 'shelves' ? 'priority' : kanbanGroupBy;
  const inColumnOrder = <T,>(columns: readonly T[]) =>
    kanbanReversed ? [...columns].reverse() : columns;

  // Configure sensors with activation constraint so clicks work
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Filter out Done projects when grouping by priority (unless showDoneColumn is true)
  const filteredProjects = groupBy === 'priority' && !showDoneColumn
    ? projects.filter((p) => p.status !== 'Done')
    : projects;

  // Get statuses to display based on showDoneColumn and hide filters
  const statusesToShow = PROJECT_STATUSES.filter(
    (s) =>
      (showDoneColumn || s !== 'Done') &&
      (!hideOnHold || s !== 'On hold') &&
      (!hideNotStarted || s !== 'Not started')
  );

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
    const sourceCol = groupBy === 'priority' ? project.priority : project.status;
    const sourceProjects = groupBy === 'priority'
      ? projectsByPriority[project.priority]
      : projectsByStatus[project.status];

    // `over.id` is either a column id or another card's project id — resolve it to a
    // column either way, otherwise a drop onto a card writes that card's UUID into the
    // status/priority enum column.
    const columnIds: readonly string[] =
      groupBy === 'priority' ? PROJECT_PRIORITIES : statusesToShow;
    const overProject = projects.find((p) => p.id === overId);
    const targetCol = columnIds.includes(overId)
      ? overId
      : overProject
        ? groupBy === 'priority'
          ? overProject.priority
          : overProject.status
        : null;

    if (!targetCol) return;

    if (targetCol === sourceCol) {
      // Same-column reorder — only meaningful when dropped onto another card
      const sourceIds = sourceProjects.map((p) => p.id);
      const oldIndex = sourceIds.indexOf(projectId);
      const newIndex = sourceIds.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newIds = arrayMove(sourceIds, oldIndex, newIndex);
        // `sourceIds` only covers currently visible cards, so writing it back verbatim
        // would drop the saved position of anything hidden by a filter. Keep those ids.
        const hiddenIds = (kanbanCardOrder[sourceCol] ?? []).filter(
          (id) => !sourceIds.includes(id)
        );
        setKanbanCardOrder({ ...kanbanCardOrder, [sourceCol]: [...newIds, ...hiddenIds] });
      }
      return;
    }

    // Cross-column move
    if (groupBy === 'priority') {
      updateProject.mutate({ id: projectId, priority: targetCol as ProjectPriority });
    } else {
      updateProject.mutate({ id: projectId, status: targetCol as ProjectStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-40 w-full rounded-xl imagination-skeleton" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl imagination-skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,12rem),1fr))] gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl imagination-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Container queries, because the width here depends on whether the Seeds rail is
          open rather than on the size of the window. */}
      <div className="@container">
        {layout === 'shelves' ? (
          <div className="flex flex-col gap-6">
            {PROJECT_PRIORITIES.map((priority) => (
              <KanbanShelf
                key={priority}
                priority={priority}
                projects={projectsByPriority[priority]}
              />
            ))}
          </div>
        ) : groupBy === 'priority' ? (
          <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
            {inColumnOrder(PROJECT_PRIORITIES).map((priority) => (
              <KanbanColumn
                key={priority}
                title={priority}
                projects={projectsByPriority[priority]}
                groupBy="priority"
              />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-3 ${statusesToShow.length >= 4 ? '@5xl:grid-cols-4' : ''}`}>
            {inColumnOrder(statusesToShow).map((status) => (
              <KanbanColumn
                key={status}
                title={status}
                projects={projectsByStatus[status]}
                groupBy="status"
                dotClassName={STATUS_DOT_COLORS[status]}
              />
            ))}
          </div>
        )}
      </div>
      <DragOverlay>
        {activeProject ? (
          <KanbanCardOverlay
            project={activeProject}
            size={layout === 'shelves' ? SHELF_CARD_SIZE[activeProject.priority] : 'standard'}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
