import { Suspense, lazy, useState } from 'react';
import { useViewStore } from '@/stores/viewStore';

// Lazily loaded and only rendered while open. Mounting these eagerly at the layout would
// pull Tiptap-adjacent form code into the initial bundle (~45 kB gzipped) for every route.
const ProjectForm = lazy(() =>
  import('@/components/projects/ProjectForm').then((m) => ({ default: m.ProjectForm })),
);
const SeedForm = lazy(() =>
  import('@/components/seeds/SeedForm').then((m) => ({ default: m.SeedForm })),
);

/**
 * The project and seed dialogs, mounted once for the whole authenticated app.
 *
 * They used to live inside ProjectsSection and SeedsSection, which only render on the
 * dashboard — and, on mobile, only while their tab is selected. "Add new" in the header
 * is available everywhere and just flips a store flag, so anywhere those sections were
 * unmounted the flag went true with no dialog listening and nothing opened.
 */
export function GlobalForms() {
  const {
    isProjectFormOpen,
    setProjectFormOpen,
    editingProject,
    setEditingProject,
    isSeedFormOpen,
    setSeedFormOpen,
    editingSeed,
    setEditingSeed,
  } = useViewStore();

  // Latch on first open and stay mounted afterwards, so closing plays the dialog's exit
  // animation instead of the component vanishing mid-transition. Adjusted during render
  // rather than in an effect — React re-runs the component before committing, so this
  // doesn't cause a second visible pass.
  const [projectFormLoaded, setProjectFormLoaded] = useState(false);
  const [seedFormLoaded, setSeedFormLoaded] = useState(false);

  if (isProjectFormOpen && !projectFormLoaded) setProjectFormLoaded(true);
  if (isSeedFormOpen && !seedFormLoaded) setSeedFormLoaded(true);

  return (
    <Suspense fallback={null}>
      {(isProjectFormOpen || projectFormLoaded) && (
        <ProjectForm
          open={isProjectFormOpen}
          onOpenChange={(open) => {
            setProjectFormOpen(open);
            if (!open) setEditingProject(null);
          }}
          projectId={editingProject}
        />
      )}
      {(isSeedFormOpen || seedFormLoaded) && (
        <SeedForm
          open={isSeedFormOpen}
          onOpenChange={(open) => {
            setSeedFormOpen(open);
            if (!open) setEditingSeed(null);
          }}
          seedId={editingSeed}
        />
      )}
    </Suspense>
  );
}
