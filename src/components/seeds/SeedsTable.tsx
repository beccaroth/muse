import { useCallback, useMemo, useState } from 'react';
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
    // The row toggles expansion, so the menu has to stop its clicks from bubbling —
    // otherwise every menu interaction would also expand or collapse the row.
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

interface ColumnOptions {
  expandedId: string | null;
  onToggle: (seedId: string) => void;
}

const getColumns = ({ expandedId, onToggle }: ColumnOptions): ColumnDef<Seed>[] => [
  {
    accessorKey: 'title',
    // No width: under table-fixed the unsized column absorbs whatever the others
    // leave, which keeps the title as wide as possible at every panel size.
    meta: { className: 'min-w-0' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const seed = row.original;
      const isExpanded = expandedId === seed.id;
      const isArchived = seed.status === 'archived';

      const body = (
        <div className="min-w-0 text-left">
          <div className={cn('font-medium flex items-center gap-2', isArchived && 'text-muted-foreground line-through')}>
            {seed.icon && <span className="shrink-0">{seed.icon}</span>}
            {/* The cell is nowrap, so wrapping has to be re-enabled explicitly when
                expanded; `break-words` splits the one description that is a bare URL. */}
            <span className={isExpanded ? 'whitespace-normal break-words' : 'truncate'}>
              {seed.title}
            </span>
          </div>
          {seed.description && (
            <div
              className={cn(
                'text-sm text-muted-foreground',
                isExpanded ? 'whitespace-normal break-words' : 'truncate',
                isArchived && 'opacity-70',
              )}
            >
              {seed.description}
            </div>
          )}
        </div>
      );

      // Nothing to reveal without a description, so no control is offered.
      if (!seed.description) return body;

      // A real button so the full text is reachable by keyboard and announced to
      // screen readers; the row's own click handler covers pointer users, and the
      // stopPropagation keeps the two from firing together and cancelling out.
      return (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse "${seed.title}"` : `Expand "${seed.title}"`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(seed.id);
          }}
          className="w-full min-w-0 cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </button>
      );
    },
  },
  {
    accessorKey: 'project_type',
    meta: { className: 'w-[22%]' },
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
    meta: { className: 'w-[26%]' },
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
    // Fixed, not a percentage: this cell holds a 32px button, and at a 320-375px
    // viewport 10% resolved to ~32px of cell — the button spilled past the rounded
    // border that clips it and pushed the table into a few px of horizontal scroll.
    meta: { className: 'w-12' },
    cell: ({ row }) => <ActionsCell seed={row.original} />,
    enableSorting: false,
  },
];

export function SeedsTable({ seeds, isLoading }: SeedsTableProps) {
  // Titles and descriptions are truncated to one line to keep the list scannable, so
  // there has to be a way back to the full text. Expanding in place beats opening the
  // edit dialog for it: reading an idea shouldn't put you in a form where a stray
  // keystroke edits data. One at a time, so the list can't unfold into a wall of text.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = useCallback((seedId: string) => {
    setExpandedId((current) => (current === seedId ? null : seedId));
  }, []);

  const columns = useMemo(
    () => getColumns({ expandedId, onToggle: toggleExpanded }),
    [expandedId, toggleExpanded],
  );

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
      // Pointer users get the whole row as the target, which also supplies the hover
      // and cursor affordance; the button inside the title cell covers keyboard users.
      onRowClick={(seed) => seed.description && toggleExpanded(seed.id)}
    />
  );
}
