import {
  FolderKanban,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Filter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProjectTable } from "./ProjectTable";
import { ProjectKanban } from "./ProjectKanban";
import { ProjectForm } from "./ProjectForm";
import { useViewStore } from "@/stores/viewStore";
import { useProjects } from "@/hooks/useProjects";
import { filterProjects } from "@/lib/projectFilters";
import SeedsToggleButton from "../seeds/SeedsToggleButton";

export function ProjectsSection({ className }: { className?: string }) {
  const {
    projectsView,
    setProjectsView,
    kanbanGroupBy,
    setKanbanGroupBy,
    showDoneColumn,
    setShowDoneColumn,
    hideOnHold,
    setHideOnHold,
    hideNotStarted,
    setHideNotStarted,
    setProjectFormOpen,
    isProjectFormOpen,
    editingProject,
    setEditingProject,
  } = useViewStore();
  const { data: projects, isLoading } = useProjects();
  const visibleProjects = filterProjects(projects ?? [], { hideOnHold, hideNotStarted });

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
          <SeedsToggleButton className="hidden md:inline-flex" />
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

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={hideOnHold || hideNotStarted ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Filter"
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Filters</p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hide-on-hold"
                      checked={hideOnHold}
                      onCheckedChange={(checked) => setHideOnHold(checked === true)}
                    />
                    <Label htmlFor="hide-on-hold" className="text-sm font-normal">
                      Hide on hold
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hide-not-started"
                      checked={hideNotStarted}
                      onCheckedChange={(checked) => setHideNotStarted(checked === true)}
                    />
                    <Label htmlFor="hide-not-started" className="text-sm font-normal">
                      Hide unstarted
                    </Label>
                  </div>
                  {projectsView === "kanban" && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="hide-done"
                        checked={!showDoneColumn}
                        onCheckedChange={(checked) => setShowDoneColumn(checked !== true)}
                      />
                      <Label htmlFor="hide-done" className="text-sm font-normal">
                        Hide done
                      </Label>
                    </div>
                  )}

                  {projectsView === "kanban" && (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-normal">Group by</Label>
                      <Select
                        value={kanbanGroupBy}
                        onValueChange={(v) =>
                          setKanbanGroupBy(v as "priority" | "status")
                        }
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Group by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TabsContent value="kanban" className="mt-0">
          <ProjectKanban projects={visibleProjects} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="table" className="mt-0">
          <ProjectTable projects={visibleProjects} isLoading={isLoading} />
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
