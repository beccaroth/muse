import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '@/lib/constants';
import { useUpdateProject } from '@/hooks/useProjects';
import { useViewStore } from '@/stores/viewStore';
import type { Project } from '@/types';
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
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Loading projects...
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
