import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressBar } from './ProgressBar';
import { StatusDot } from './StatusDot';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { getTypeColor, PROJECT_STATUSES, PROJECT_PRIORITIES } from '@/lib/constants';
import { useViewStore } from '@/stores/viewStore';
import { useDeleteProjectWithUndo } from '@/hooks/useDeleteProjectWithUndo';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
}

// Custom sort functions for status and priority
const statusOrder = Object.fromEntries(PROJECT_STATUSES.map((s, i) => [s, i]));
const priorityOrder = Object.fromEntries(PROJECT_PRIORITIES.map((p, i) => [p, i]));

export function ProjectTable({ projects, isLoading }: ProjectTableProps) {
  const navigate = useNavigate();
  const { setEditingProject } = useViewStore();
  const { deleteProject } = useDeleteProjectWithUndo();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'project_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="flex items-center gap-2 font-medium">
          {row.original.icon && <span>{row.original.icon}</span>}
          {row.original.project_name}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <StatusDot status={row.original.status} />
          <span className="text-sm">{row.original.status}</span>
        </span>
      ),
      sortingFn: (rowA, rowB) => {
        return statusOrder[rowA.original.status] - statusOrder[rowB.original.status];
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.priority}
        </Badge>
      ),
      sortingFn: (rowA, rowB) => {
        return priorityOrder[rowA.original.priority] - priorityOrder[rowB.original.priority];
      },
    },
    {
      accessorKey: 'project_types',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.project_types.map((type) => (
            <Badge key={type} variant="outline" className={cn('text-xs', getTypeColor(type))}>
              {type}
            </Badge>
          ))}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const aTypes = rowA.original.project_types.join(', ');
        const bTypes = rowB.original.project_types.join(', ');
        return aTypes.localeCompare(bTypes);
      },
    },
    {
      accessorKey: 'progress',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row }) => (
        <div className="w-32">
          <ProgressBar progress={row.original.progress} showLabel />
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingProject(row.original.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setProjectToDelete(row.original)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="border-b px-4 py-3 flex gap-6">
          {['w-32', 'w-20', 'w-16', 'w-20', 'w-24'].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w} imagination-skeleton`} />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-3 flex items-center gap-6">
            <Skeleton className="h-4 w-32 imagination-skeleton" />
            <Skeleton className="h-4 w-20 imagination-skeleton" />
            <Skeleton className="h-5 w-16 rounded-full imagination-skeleton" />
            <Skeleton className="h-5 w-14 rounded-full imagination-skeleton" />
            <Skeleton className="h-2 w-24 rounded-full imagination-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        emptyMessage="No projects yet. Create your first project!"
        onRowClick={(project) => navigate({ to: '/project/$projectId', params: { projectId: project.id } })}
      />

      <DeleteProjectDialog
        project={projectToDelete}
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
