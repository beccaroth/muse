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
import { MoreHorizontal, Pencil, Trash2, ArrowRight, Archive, Inbox } from 'lucide-react';
import { getTypeColor } from '@/lib/constants';
import { useViewStore } from '@/stores/viewStore';
import { useDeleteSeed, useUpdateSeed } from '@/hooks/useSeeds';
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
  const updateSeed = useUpdateSeed();
  const { promoteSeed } = usePromoteSeedWithUndo();
  const isArchived = seed.status === 'archived';

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
        <DropdownMenuItem
          onClick={() =>
            updateSeed.mutate({ id: seed.id, status: isArchived ? 'active' : 'archived' })
          }
        >
          {isArchived ? (
            <Inbox className="h-4 w-4 mr-2" />
          ) : (
            <Archive className="h-4 w-4 mr-2" />
          )}
          {isArchived ? 'Unarchive' : 'Archive'}
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
          <div className={cn('font-medium flex items-center gap-2', seed.status === 'archived' && 'text-muted-foreground line-through')}>
            {seed.icon && <span>{seed.icon}</span>}
            {seed.title}
          </div>
          {seed.description && (
            <div className={cn('text-sm text-muted-foreground line-clamp-1', seed.status === 'archived' && 'opacity-70')}>
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
