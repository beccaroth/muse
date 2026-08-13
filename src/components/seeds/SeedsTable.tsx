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
import { cn, parseDateOnly } from '@/lib/utils';

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
    // Rows open the seed, so the menu has to stop its clicks from bubbling —
    // otherwise every menu interaction would also fire the row handler.
    <div onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}

const columns: ColumnDef<Seed>[] = [
  {
    accessorKey: 'title',
    // Percentage widths rather than fixed: the seeds panel is a third of the dashboard
    // on desktop but full-bleed on mobile, and percentages leave the title ~50% more
    // room at narrow widths while still never clipping the type badge or the date.
    meta: { className: 'w-[46%] min-w-0' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const seed = row.original;
      return (
        <div className="min-w-0">
          <div className={cn('font-medium flex items-center gap-2', seed.status === 'archived' && 'text-muted-foreground line-through')}>
            {seed.icon && <span className="shrink-0">{seed.icon}</span>}
            <span className="truncate">{seed.title}</span>
          </div>
          {seed.description && (
            // `truncate` rather than `line-clamp-1`: the cell is nowrap, so the clamp
            // never wrapped anything and the element kept its full intrinsic width.
            <div
              className={cn('text-sm text-muted-foreground truncate', seed.status === 'archived' && 'opacity-70')}
              title={seed.description}
            >
              {seed.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'project_type',
    meta: { className: 'w-[20%]' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const projectType = row.getValue('project_type') as string | null;
      if (!projectType) return null;
      return (
        <Badge
          variant="outline"
          className={cn('text-xs max-w-full truncate', getTypeColor(projectType))}
          title={projectType}
        >
          {projectType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'date_added',
    meta: { className: 'w-[24%]' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added" />
    ),
    cell: ({ row }) => {
      const dateAdded = row.getValue('date_added') as string;
      return (
        <span className="text-sm text-muted-foreground">
          {format(parseDateOnly(dateAdded), 'MMM d, yyyy')}
        </span>
      );
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-[10%]' },
    cell: ({ row }) => <ActionsCell seed={row.original} />,
    enableSorting: false,
  },
];

export function SeedsTable({ seeds, isLoading }: SeedsTableProps) {
  const setEditingSeed = useViewStore((state) => state.setEditingSeed);

  if (isLoading) {
    return <Loading size="sm" className="h-32" />;
  }

  return (
    <DataTable
      // `table-fixed` stops the auto layout from widening the Title column to fit its
      // longest description (a single unbroken URL was pushing the table into a
      // horizontal scroll). Widths come from the column meta instead.
      className="table-fixed"
      columns={columns}
      data={seeds}
      emptyMessage="No seeds yet. Capture your first idea!"
      // Titles and descriptions are truncated to one line to keep the list scannable,
      // so the row has to lead somewhere that shows the full text. Opening the seed
      // does that, and matches how rows behave in the projects table.
      onRowClick={(seed) => setEditingSeed(seed.id)}
    />
  );
}
