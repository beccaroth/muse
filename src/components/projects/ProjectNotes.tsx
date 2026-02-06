import { useEffect, useRef, useCallback } from 'react';
import { useUpdateProject } from '@/hooks/useProjects';
import { SimpleEditor } from '@/components/tiptap/templates/simple/simple-editor';
import type { Project } from '@/types';

const DEBOUNCE_MS = 1500;

interface ProjectNotesProps {
  project: Project;
}

export function ProjectNotes({ project }: ProjectNotesProps) {
  const updateProject = useUpdateProject();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(project.notes ?? '');
  const latestHtmlRef = useRef(project.notes ?? '');
  const projectIdRef = useRef(project.id);

  useEffect(() => {
    projectIdRef.current = project.id;
  }, [project.id]);

  const saveNotes = useCallback(
    (html: string) => {
      const normalizedHtml = html === '<p></p>' ? '' : html;
      if (normalizedHtml === lastSavedRef.current) return;

      lastSavedRef.current = normalizedHtml;
      updateProject.mutate({
        id: projectIdRef.current,
        notes: normalizedHtml || null,
      });
    },
    [updateProject],
  );

  const handleUpdate = useCallback(
    (html: string) => {
      latestHtmlRef.current = html;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        saveNotes(html);
      }, DEBOUNCE_MS);
    },
    [saveNotes],
  );

  // Flush pending saves on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        const normalizedHtml =
          latestHtmlRef.current === '<p></p>' ? '' : latestHtmlRef.current;
        if (normalizedHtml !== lastSavedRef.current) {
          updateProject.mutate({
            id: projectIdRef.current,
            notes: normalizedHtml || null,
          });
        }
      }
    };
  }, [updateProject]);

  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Notes</h2>
        {updateProject.isPending && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
      </div>
      <SimpleEditor
        content={project.notes ?? ''}
        onUpdate={handleUpdate}
        placeholder="Add notes about this project..."
      />
    </div>
  );
}
