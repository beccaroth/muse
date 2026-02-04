import { create } from 'zustand';

type ViewType = 'table' | 'kanban';

interface ViewState {
  projectsView: ViewType;
  setProjectsView: (view: ViewType) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isProjectFormOpen: boolean;
  setProjectFormOpen: (open: boolean) => void;
  editingProject: string | null;
  setEditingProject: (id: string | null) => void;
  isSeedFormOpen: boolean;
  setSeedFormOpen: (open: boolean) => void;
  editingSeed: string | null;
  setEditingSeed: (id: string | null) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  projectsView: 'kanban',
  setProjectsView: (view) => set({ projectsView: view }),
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  isProjectFormOpen: false,
  setProjectFormOpen: (open) => set({ isProjectFormOpen: open, editingProject: open ? null : null }),
  editingProject: null,
  setEditingProject: (id) => set({ editingProject: id, isProjectFormOpen: !!id }),
  isSeedFormOpen: false,
  setSeedFormOpen: (open) => set({ isSeedFormOpen: open, editingSeed: open ? null : null }),
  editingSeed: null,
  setEditingSeed: (id) => set({ editingSeed: id, isSeedFormOpen: !!id }),
}));
