import type { ComponentProps } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { Pencil, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgressBar } from "./ProgressBar";
import { StatusDot } from "./StatusDot";
import { useViewStore } from "@/stores/viewStore";
import { useUpdateProject } from "@/hooks/useProjects";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { PROJECT_STATUSES, PROJECT_PRIORITIES, getTypeColor } from "@/lib/constants";
import type { Project } from "@/types";
import type { KanbanCardSize, ProjectStatus, ProjectPriority } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  project: Project;
  size?: KanbanCardSize;
  kanbanGroupBy?: "priority" | "status";
}

function CardActions({
  project,
  size,
  kanbanGroupBy,
  isMobile,
}: Required<Pick<KanbanCardProps, "project" | "size">> & {
  kanbanGroupBy?: "priority" | "status";
  isMobile: boolean;
}) {
  const { setEditingProject } = useViewStore();
  const updateProject = useUpdateProject();
  const buttonClass = cn(
    "h-7 w-7",
    size === "compact" && "bg-card",
    size === "feature" &&
      "text-feature-foreground hover:bg-white/15 hover:text-feature-foreground dark:hover:bg-white/15",
  );

  const handleStatusChange = (status: ProjectStatus) => {
    if (project.status !== status) {
      updateProject.mutate({ id: project.id, status });
    }
  };

  const handlePriorityChange = (priority: ProjectPriority) => {
    if (project.priority !== priority) {
      updateProject.mutate({ id: project.id, priority });
    }
  };

  return (
    // z-10 lifts the controls above the title link's stretched hit area.
    <div
      className={cn(
        "absolute right-2 z-10 flex items-center gap-0.5",
        size === "compact" ? "top-1/2 -translate-y-1/2" : "top-2",
      )}
    >
      {isMobile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={buttonClass}
              aria-label={`Move ${project.project_name}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {kanbanGroupBy === "priority" ? (
              <>
                <DropdownMenuLabel>Move to priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PROJECT_PRIORITIES.map((priority) => (
                  <DropdownMenuItem
                    key={priority}
                    disabled={project.priority === priority}
                    onClick={() => handlePriorityChange(priority)}
                  >
                    {priority}
                    {project.priority === priority && " (current)"}
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <>
                <DropdownMenuLabel>Move to status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PROJECT_STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={project.status === status}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                    {project.status === status && " (current)"}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonClass,
          "transition-opacity sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100",
        )}
        aria-label={`Edit ${project.project_name}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setEditingProject(project.id)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function CardTitle({ project, className }: { project: Project; className?: string }) {
  return (
    <h4 className={cn("font-display font-semibold tracking-tight", className)}>
      {/* The ::after stretches the link across the whole card so anywhere on it opens the
          project. draggable={false} keeps the browser's native link drag out of the way of
          dnd-kit, which only starts a drag after 8px of movement, so clicks still land. */}
      <Link
        to="/project/$projectId"
        params={{ projectId: project.id }}
        draggable={false}
        className="decoration-2 underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-xl group-hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring"
      >
        {project.project_name}
      </Link>
    </h4>
  );
}

function ProjectCardBody({ project, size }: { project: Project; size: KanbanCardSize }) {
  const description = project.description?.trim();

  if (size === "feature") {
    return (
      <div className="flex flex-1 flex-col gap-5 p-6 @2xl:flex-row @2xl:items-center @2xl:gap-8 @2xl:p-8">
        {project.icon && (
          // The light tile keeps dark emoji legible against the plum.
          <span
            aria-hidden
            className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-5xl leading-none @2xl:size-24 @2xl:text-6xl"
          >
            {project.icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <CardTitle project={project} className="pr-8 text-3xl leading-tight @2xl:text-4xl" />
          {description && (
            <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-feature-muted @2xl:text-lg">
              {description}
            </p>
          )}
        </div>
        {/* mt-auto lines status and progress up when Now cards share a row. */}
        <div className="mt-auto flex shrink-0 flex-col gap-3 @2xl:mt-0 @2xl:w-72">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <StatusDot status={project.status} />
              {project.status}
            </span>
            {project.project_types.map((type) => (
              <Badge
                key={type}
                variant="outline"
                className="border-transparent bg-white/15 text-xs text-feature-foreground"
              >
                {type}
              </Badge>
            ))}
          </div>
          <ProgressBar progress={project.progress} showLabel variant="feature" />
        </div>
      </div>
    );
  }

  if (size === "compact") {
    return (
      // No room reserved on the right for the hover-only edit button (it sits over the text),
      // except on phones, where its buttons are always showing.
      <div className="flex items-center gap-3 p-3 max-sm:pr-16">
        {project.icon && (
          <span aria-hidden className="text-2xl leading-none">
            {project.icon}
          </span>
        )}
        <div className="min-w-0 flex-1" title={description}>
          <CardTitle project={project} className="truncate text-[15px] leading-snug" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusDot status={project.status} />
            {project.status}
            {project.progress > 0 && (
              <span className="ml-1 tabular-nums">{project.progress}%</span>
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-5">
      {project.icon && (
        <span aria-hidden className="text-4xl leading-none">
          {project.icon}
        </span>
      )}
      <div className="min-w-0">
        <CardTitle project={project} className="pr-6 text-xl leading-snug" />
        {description && (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground" title={description}>
            {description}
          </p>
        )}
      </div>
      {/* mt-auto lines the status and progress up across a row of unequal loglines. */}
      <div className="mt-auto flex flex-col gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusDot status={project.status} />
            {project.status}
          </span>
          {project.project_types.slice(0, 2).map((type) => (
            <Badge key={type} variant="outline" className={cn("text-xs", getTypeColor(type))}>
              {type}
            </Badge>
          ))}
          {project.project_types.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{project.project_types.length - 2}
            </Badge>
          )}
        </div>
        <ProgressBar progress={project.progress} showLabel />
      </div>
    </div>
  );
}

const SIZE_CLASSES: Record<KanbanCardSize, string> = {
  feature: "@container border-transparent bg-feature text-feature-foreground shadow-md",
  standard: "hover:border-primary/40",
  compact: "bg-card/70 shadow-none hover:border-primary/40",
};

function ProjectCard({
  project,
  size,
  kanbanGroupBy,
  isMobile,
  className,
  ...cardProps
}: KanbanCardProps &
  ComponentProps<typeof Card> & {
    size: KanbanCardSize;
    isMobile: boolean;
  }) {
  return (
    <Card
      {...cardProps}
      className={cn("group relative gap-0 py-0", SIZE_CLASSES[size], className)}
    >
      <ProjectCardBody project={project} size={size} />
      <CardActions
        project={project}
        size={size}
        kanbanGroupBy={kanbanGroupBy}
        isMobile={isMobile}
      />
    </Card>
  );
}

export function KanbanCard({ project, size = "standard", kanbanGroupBy }: KanbanCardProps) {
  const isMobile = useIsBreakpoint("max", 640);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    disabled: isMobile,
  });

  return (
    <ProjectCard
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...(isMobile ? {} : listeners)}
      {...(isMobile ? {} : attributes)}
      project={project}
      size={size}
      kanbanGroupBy={kanbanGroupBy}
      isMobile={isMobile}
      className={cn(!isMobile && "cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
    />
  );
}

/** The card as it follows the pointer in the DragOverlay. Not itself sortable. */
export function KanbanCardOverlay({ project, size = "standard" }: KanbanCardProps) {
  return (
    <ProjectCard
      project={project}
      size={size}
      isMobile={false}
      className="rotate-1 cursor-grabbing shadow-xl shadow-primary/20 hover:shadow-xl"
    />
  );
}
