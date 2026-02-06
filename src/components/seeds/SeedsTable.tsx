import { format } from 'date-fns';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { getTypeColor } from '@/lib/constants';
import { useViewStore } from '@/stores/viewStore';
import { useDeleteSeed } from '@/hooks/useSeeds';
import { usePromoteSeedWithUndo } from '@/hooks/usePromoteSeedWithUndo';
import { Loading } from '@/components/ui/loading';
import type { Seed } from '@/types';
import { cn } from '@/lib/utils';

interface SeedsTableProps {
  seeds: Seed[];
  isLoading: boolean;
}

function ActionsCell({ seed }: { seed: Seed }) {
  const { setEditingSeed } = useViewStore();
  const deleteSeed = useDeleteSeed();
  const { promoteSeed } = usePromoteSeedWithUndo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => promoteSeed(seed)}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Promote to Project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setEditingSeed(seed.id)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => deleteSeed.mutate(seed.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<Seed>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const seed = row.original;
      return (
        <div>
          <div className="font-medium flex items-center gap-2">
            {seed.icon && <span>{seed.icon}</span>}
            {seed.title}
          </div>
          {seed.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {seed.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'project_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const projectType = row.getValue('project_type') as string | null;
      if (!projectType) return null;
      return (
        <Badge variant="outline" className={cn('text-xs', getTypeColor(projectType))}>
          {projectType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'date_added',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added" />
    ),
    cell: ({ row }) => {
      const dateAdded = row.getValue('date_added') as string;
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(dateAdded), 'MMM d, yyyy')}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell seed={row.original} />,
    enableSorting: false,
  },
];

export function SeedsTable({ seeds, isLoading }: SeedsTableProps) {
  if (isLoading) {
    return <Loading size="sm" className="h-32" />;
  }

  return (
    <DataTable
      columns={columns}
      data={seeds}
      emptyMessage="No seeds yet. Capture your first idea!"
    />
  );
}
