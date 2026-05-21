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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterToggle } from "@/components/ui/filter-toggle";
import { Separator } from "@/components/ui/separator";
import { ProjectTable } from "./ProjectTable";
import { ProjectKanban } from "./ProjectKanban";
import { ProjectForm } from "./ProjectForm";
import { useViewStore } from "@/stores/viewStore";
import { useProjects } from "@/hooks/useProjects";
import { filterProjects } from "@/lib/projectFilters";
import { cn } from "@/lib/utils";
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
  const activeFilterCount = [hideOnHold, hideNotStarted].filter(Boolean).length;

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
                  variant={activeFilterCount > 0 ? "default" : "outline"}
                  size="icon"
                  className="relative h-8 w-8"
                  aria-label="Filter"
                >
                  <Filter className="h-3 w-3" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60 overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 p-1.5">
                  <p className="px-2 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Show / hide
                  </p>
                  <FilterToggle
                    id="hide-on-hold"
                    label="Hide on hold"
                    checked={hideOnHold}
                    onCheckedChange={setHideOnHold}
                  />
                  <FilterToggle
                    id="hide-not-started"
                    label="Hide unstarted"
                    checked={hideNotStarted}
                    onCheckedChange={setHideNotStarted}
                  />
                  {projectsView === "kanban" && (
                    <FilterToggle
                      id="hide-done"
                      label="Hide done"
                      checked={!showDoneColumn}
                      onCheckedChange={(value) => setShowDoneColumn(!value)}
                    />
                  )}
                </div>

                {projectsView === "kanban" && (
                  <>
                    <Separator />
                    <div className="px-3 py-2.5">
                      <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Group by
                      </p>
                      <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted p-0.5">
                        {(["priority", "status"] as const).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setKanbanGroupBy(option)}
                            className={cn(
                              "rounded-md px-2 py-1 text-xs font-medium capitalize transition-all",
                              kanbanGroupBy === option
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
