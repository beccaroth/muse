import { useUpdateProject } from '@/hooks/useProjects';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { NotesEditor } from '@/components/tiptap/notes-editor';
import type { Project } from '@/types';

interface ProjectNotesProps {
  project: Project;
}

export function ProjectNotes({ project }: ProjectNotesProps) {
  const updateProject = useUpdateProject();

  const handleUpdate = useDebouncedSave((html) => {
    updateProject.mutate({
      id: project.id,
      notes: html || null,
    });
  });

  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Notes</h2>
        {updateProject.isPending && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
      </div>
      <NotesEditor
        content={project.notes ?? ''}
        onUpdate={handleUpdate}
        placeholder="Add notes about this project..."
      />
    </div>
  );
}
