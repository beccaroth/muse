import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { PROJECT_PRIORITIES } from '@/lib/constants';
import { useUpdateProject } from '@/hooks/useProjects';
import type { Project } from '@/types';
import type { ProjectPriority } from '@/lib/constants';

interface ProjectKanbanProps {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectKanban({ projects, isLoading }: ProjectKanbanProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const updateProject = useUpdateProject();

  const projectsByPriority = PROJECT_PRIORITIES.reduce(
    (acc, priority) => {
      acc[priority] = projects.filter((p) => p.priority === priority && p.status !== 'Done');
      return acc;
    },
    {} as Record<ProjectPriority, Project[]>
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
    const newPriority = over.id as ProjectPriority;

    const project = projects.find((p) => p.id === projectId);
    if (project && project.priority !== newPriority) {
      updateProject.mutate({ id: projectId, priority: newPriority });
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
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {PROJECT_PRIORITIES.map((priority) => (
          <KanbanColumn
            key={priority}
            priority={priority}
            projects={projectsByPriority[priority]}
          />
        ))}
      </div>
      <DragOverlay>
        {activeProject ? <KanbanCard project={activeProject} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
