import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { Pencil, MoreVertical } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { ProjectStatus, ProjectPriority } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  project: Project;
  isDragging?: boolean;
  kanbanGroupBy?: "priority" | "status";
}

export function KanbanCard({ project, isDragging, kanbanGroupBy }: KanbanCardProps) {
  const { setEditingProject } = useViewStore();
  const updateProject = useUpdateProject();
  const isMobile = useIsBreakpoint("max", 640);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
    disabled: isMobile,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

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
    <Card
      ref={setNodeRef}
      style={style}
      {...(isMobile ? {} : listeners)}
      {...(isMobile ? {} : attributes)}
      className={cn(
        "group relative transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
        !isMobile && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-xl shadow-primary/20 scale-[1.02]",
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {project.icon && <span>{project.icon}</span>}
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
            className="hover:underline cursor-pointer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {project.project_name}
          </Link>
        </CardTitle>
        <CardDescription>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusDot status={project.status} />
            {project.status}
          </span>
        </CardDescription>
        <CardAction className="flex items-center gap-0.5">
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 z-10"
                  onClick={(e) => e.stopPropagation()}
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
            className="h-7 w-7 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.stopPropagation();
              setEditingProject(project.id);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {project.project_types.slice(0, 2).map((type) => (
            <Badge
              key={type}
              variant="outline"
              className={cn("text-xs", getTypeColor(type))}
            >
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
      </CardContent>
    </Card>
  );
}
