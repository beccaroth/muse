import { format } from 'date-fns';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { getTypeColor } from '@/lib/constants';
import { useViewStore } from '@/stores/viewStore';
import { useDeleteSeed } from '@/hooks/useSeeds';
import { useCreateProject } from '@/hooks/useProjects';
import type { Seed } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SeedsTableProps {
  seeds: Seed[];
  isLoading: boolean;
}

export function SeedsTable({ seeds, isLoading }: SeedsTableProps) {
  const { setEditingSeed } = useViewStore();
  const deleteSeed = useDeleteSeed();
  const createProject = useCreateProject();

  const handlePromote = async (seed: Seed) => {
    try {
      await createProject.mutateAsync({
        project_name: seed.title,
        description: seed.description,
        project_types: seed.project_type ? [seed.project_type] : [],
        status: 'Not started',
        priority: 'Someday',
        progress: 0,
        start_date: null,
        end_date: null,
      });
      await deleteSeed.mutateAsync(seed.id);
      toast.success(`"${seed.title}" promoted to project!`);
    } catch {
      toast.error('Failed to promote seed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Loading seeds...
      </div>
    );
  }

  if (seeds.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No seeds yet. Capture your first idea!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seeds.map((seed) => (
            <TableRow key={seed.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{seed.title}</div>
                  {seed.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {seed.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {seed.project_type && (
                  <Badge variant="outline" className={cn('text-xs', getTypeColor(seed.project_type))}>
                    {seed.project_type}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(seed.date_added), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePromote(seed)}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
