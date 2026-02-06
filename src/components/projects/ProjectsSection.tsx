import {
  FolderKanban,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectTable } from "./ProjectTable";
import { ProjectKanban } from "./ProjectKanban";
import { ProjectForm } from "./ProjectForm";
import { useViewStore } from "@/stores/viewStore";
import { useProjects } from "@/hooks/useProjects";
import SeedsToggleButton from "../seeds/SeedsToggleButton";

export function ProjectsSection({ className }: { className?: string }) {
  const {
    projectsView,
    setProjectsView,
    kanbanGroupBy,
    setKanbanGroupBy,
    showDoneColumn,
    setShowDoneColumn,
    setProjectFormOpen,
    isProjectFormOpen,
    editingProject,
    setEditingProject,
  } = useViewStore();
  const { data: projects, isLoading } = useProjects();

  return (
    <Section
      title="Projects"
      icon={<FolderKanban className="h-5 w-5" />}
      actions={
        <>
          <Button size="sm" onClick={() => setProjectFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
          <SeedsToggleButton />
        </>
      }
      className={className}
    >
      <Tabs
        value={projectsView}
        onValueChange={(v) => setProjectsView(v as "table" | "kanban")}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </TabsTrigger>
          </TabsList>

          {projectsView === "kanban" && (
            <div className="flex items-center gap-2">
              <Select
                value={kanbanGroupBy}
                onValueChange={(v) =>
                  setKanbanGroupBy(v as "priority" | "status")
                }
              >
                <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">By Priority</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                </SelectContent>
              </Select>

              {kanbanGroupBy === "status" && (
                <Button
                  variant={showDoneColumn ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowDoneColumn(!showDoneColumn)}
                >
                  {showDoneColumn ? (
                    <Eye className="h-3 w-3 mr-1" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-1" />
                  )}
                  Done
                </Button>
              )}
            </div>
          )}
        </div>

        <TabsContent value="kanban" className="mt-0">
          <ProjectKanban projects={projects ?? []} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="table" className="mt-0">
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
