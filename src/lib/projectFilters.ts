import type { Project } from '@/types';

export interface ProjectFilters {
  hideOnHold?: boolean;
  hideNotStarted?: boolean;
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter((project) => {
    if (filters.hideOnHold && project.status === 'On hold') return false;
    if (filters.hideNotStarted && project.status === 'Not started') return false;
    return true;
  });
}
