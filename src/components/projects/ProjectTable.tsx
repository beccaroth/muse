import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { StatusDot } from './StatusDot';
import { getTypeColor } from '@/lib/constants';
import { useViewStore } from '@/stores/viewStore';
import { useDeleteProject } from '@/hooks/useProjects';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectTable({ projects, isLoading }: ProjectTableProps) {
  const { setEditingProject } = useViewStore();
  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No projects yet. Create your first project!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.project_name}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <StatusDot status={project.status} />
                  <span className="text-sm">{project.status}</span>
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {project.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {project.project_types.map((type) => (
                    <Badge key={type} variant="outline" className={cn('text-xs', getTypeColor(type))}>
                      {type}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="w-32">
                <ProgressBar progress={project.progress} showLabel />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingProject(project.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteProject.mutate(project.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
