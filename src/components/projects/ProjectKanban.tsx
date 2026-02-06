import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
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

export function ProjectKanban({ projects, isLoading }: ProjectKanbanProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const updateProject = useUpdateProject();
  const { kanbanGroupBy, showDoneColumn } = useViewStore();

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
      acc[priority] = filteredProjects.filter((p) => p.priority === priority);
      return acc;
    },
    {} as Record<ProjectPriority, Project[]>
  );

  const projectsByStatus = statusesToShow.reduce(
    (acc, status) => {
      acc[status] = projects.filter((p) => p.status === status);
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
    const project = projects.find((p) => p.id === projectId);

    if (!project) return;

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
