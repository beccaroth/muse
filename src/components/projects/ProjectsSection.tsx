import { FolderKanban, Plus, Table as TableIcon, LayoutGrid } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTable } from './ProjectTable';
import { ProjectKanban } from './ProjectKanban';
import { ProjectForm } from './ProjectForm';
import { useViewStore } from '@/stores/viewStore';
import { useProjects } from '@/hooks/useProjects';

export function ProjectsSection() {
  const { projectsView, setProjectsView, setProjectFormOpen, isProjectFormOpen, editingProject, setEditingProject } = useViewStore();
  const { data: projects, isLoading } = useProjects();

  return (
    <Section
      title="Projects"
      icon={<FolderKanban className="h-5 w-5" />}
      actions={
        <Button size="sm" onClick={() => setProjectFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Project
        </Button>
      }
    >
      <Tabs value={projectsView} onValueChange={(v) => setProjectsView(v as 'table' | 'kanban')}>
        <TabsList className="mb-4">
          <TabsTrigger value="kanban">
            <LayoutGrid className="h-4 w-4 mr-1" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="table">
            <TableIcon className="h-4 w-4 mr-1" />
            Table
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <ProjectKanban projects={projects ?? []} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="table">
          <ProjectTable projects={projects ?? []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <ProjectForm
        open={isProjectFormOpen}
        onOpenChange={(open) => {
          setProjectFormOpen(open);
          if (!open) setEditingProject(null);
        }}
        projectId={editingProject}
      />
    </Section>
  );
}
