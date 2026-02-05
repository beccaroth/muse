import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { StatusDot } from './StatusDot';
import { useProject, useDeleteProject } from '@/hooks/useProjects';
import { useViewStore } from '@/stores/viewStore';
import { getTypeColor } from '@/lib/constants';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectDetailDialogProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailDialog({ projectId, open, onOpenChange }: ProjectDetailDialogProps) {
  const { data: project } = useProject(projectId);
  const deleteProject = useDeleteProject();
  const { setEditingProject } = useViewStore();

  if (!project) return null;

  const handleEdit = () => {
    onOpenChange(false);
    setEditingProject(project.id);
  };

  const handleDelete = () => {
    deleteProject.mutate(project.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {project.icon && <span className="text-2xl">{project.icon}</span>}
            {project.project_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Priority Row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StatusDot status={project.status} className="h-3 w-3" />
              <span className="text-sm font-medium">{project.status}</span>
            </div>
            <Badge variant="secondary">{project.priority}</Badge>
          </div>

          {/* Project Types */}
          {project.project_types.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.project_types.map((type) => (
                <Badge key={type} variant="outline" className={cn(getTypeColor(type))}>
                  {type}
                </Badge>
              ))}
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <ProgressBar progress={project.progress} className="h-3" />
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Dates */}
          {(project.start_date || project.end_date) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {project.start_date && (
                <span>Started: {format(new Date(project.start_date), 'MMM d, yyyy')}</span>
              )}
              {project.end_date && (
                <span>Due: {format(new Date(project.end_date), 'MMM d, yyyy')}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
