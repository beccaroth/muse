import { create } from 'zustand';

type ViewType = 'table' | 'kanban';
type KanbanGroupBy = 'priority' | 'status';
type MobileDashboardTab = 'projects' | 'seeds';
export type CalendarView = 'month' | 'week' | 'twelveWeek';

const CARD_ORDER_KEY = 'muse-kanban-card-order';

// Maps column id (e.g. "Now", "In progress") to ordered array of project IDs
type KanbanCardOrder = Record<string, string[]>;

const getInitialCardOrder = (): KanbanCardOrder => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(CARD_ORDER_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

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
  kanbanCardOrder: KanbanCardOrder;
  setKanbanCardOrder: (order: KanbanCardOrder) => void;
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
  calendarDate: string;
  setCalendarDate: (date: string) => void;
  calendarShowProjects: boolean;
  setCalendarShowProjects: (show: boolean) => void;
  calendarShowTasks: boolean;
  setCalendarShowTasks: (show: boolean) => void;
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
  kanbanCardOrder: getInitialCardOrder(),
  setKanbanCardOrder: (order) => {
    set({ kanbanCardOrder: order });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(order));
    }
  },
  calendarView: 'month',
  setCalendarView: (view) => set({ calendarView: view }),
  calendarDate: new Date().toISOString().split('T')[0],
  setCalendarDate: (date) => set({ calendarDate: date }),
  calendarShowProjects: true,
  setCalendarShowProjects: (show) => set({ calendarShowProjects: show }),
  calendarShowTasks: true,
  setCalendarShowTasks: (show) => set({ calendarShowTasks: show }),
}));
