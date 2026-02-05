import { create } from 'zustand';

type ViewType = 'table' | 'kanban';
type KanbanGroupBy = 'priority' | 'status';
type MobileDashboardTab = 'projects' | 'seeds';

interface ViewState {
  projectsView: ViewType;
  setProjectsView: (view: ViewType) => void;
  kanbanGroupBy: KanbanGroupBy;
  setKanbanGroupBy: (groupBy: KanbanGroupBy) => void;
  showDoneColumn: boolean;
  setShowDoneColumn: (show: boolean) => void;
  showSeeds: boolean;
  setShowSeeds: (show: boolean) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  viewingProject: string | null;
  setViewingProject: (id: string | null) => void;
  isProjectFormOpen: boolean;
  setProjectFormOpen: (open: boolean) => void;
  editingProject: string | null;
  setEditingProject: (id: string | null) => void;
  isSeedFormOpen: boolean;
  setSeedFormOpen: (open: boolean) => void;
  editingSeed: string | null;
  setEditingSeed: (id: string | null) => void;
  mobileDashboardTab: MobileDashboardTab;
  setMobileDashboardTab: (tab: MobileDashboardTab) => void;
  isAddNewOpen: boolean;
  setAddNewOpen: (open: boolean) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  projectsView: 'kanban',
  setProjectsView: (view) => set({ projectsView: view }),
  kanbanGroupBy: 'priority',
  setKanbanGroupBy: (groupBy) => set({ kanbanGroupBy: groupBy }),
  showDoneColumn: false,
  setShowDoneColumn: (show) => set({ showDoneColumn: show }),
  showSeeds: true,
  setShowSeeds: (show) => set({ showSeeds: show }),
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  viewingProject: null,
  setViewingProject: (id) => set({ viewingProject: id }),
  isProjectFormOpen: false,
  setProjectFormOpen: (open) => set({ isProjectFormOpen: open, editingProject: open ? null : null }),
  editingProject: null,
  setEditingProject: (id) => set({ editingProject: id, isProjectFormOpen: !!id }),
  isSeedFormOpen: false,
  setSeedFormOpen: (open) => set({ isSeedFormOpen: open, editingSeed: open ? null : null }),
  editingSeed: null,
  setEditingSeed: (id) => set({ editingSeed: id, isSeedFormOpen: !!id }),
  mobileDashboardTab: 'projects',
  setMobileDashboardTab: (tab) => set({ mobileDashboardTab: tab }),
  isAddNewOpen: false,
  setAddNewOpen: (open) => set({ isAddNewOpen: open }),
}));
