import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useProject } from '@/hooks/useProjects';
import { useDeleteProjectWithUndo } from '@/hooks/useDeleteProjectWithUndo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { StatusDot } from './StatusDot';
import { ProjectForm } from './ProjectForm';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { getTypeColor } from '@/lib/constants';
import { ChevronLeft, Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ProjectPage() {
  const { projectId } = useParams({ from: '/project/$projectId' });
  const { data: project, isLoading } = useProject(projectId);
  const { deleteProject } = useDeleteProjectWithUndo();
  const navigate = useNavigate();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleConfirmDelete = () => {
    if (project) {
      deleteProject(project, () => navigate({ to: '/' }));
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-muted-foreground">Project not found</div>
        <Link to="/">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {project.icon && <span className="text-5xl">{project.icon}</span>}
          <div>
            <h1 className="text-3xl font-bold">{project.project_name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-2">
                <StatusDot status={project.status} className="h-3 w-3" />
                <span className="text-sm text-muted-foreground">{project.status}</span>
              </span>
              <Badge variant="secondary">{project.priority}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditFormOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Types */}
      {project.project_types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.project_types.map((type) => (
            <Badge key={type} variant="outline" className={cn(getTypeColor(type))}>
              {type}
            </Badge>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Progress</h2>
          <span className="text-2xl font-bold">{project.progress}%</span>
        </div>
        <ProgressBar progress={project.progress} className="h-4" />
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

      {/* Dates */}
      {(project.start_date || project.end_date) && (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Timeline</h2>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {project.start_date && (
              <span>Started: {format(new Date(project.start_date), 'MMM d, yyyy')}</span>
            )}
            {project.end_date && (
              <span>Due: {format(new Date(project.end_date), 'MMM d, yyyy')}</span>
            )}
          </div>
        </div>
      )}

      {/* Edit Form Dialog */}
      <ProjectForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        project={project}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
