export const PROJECT_STATUSES = ['Not started', 'On hold', 'In progress', 'Done'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ['Now', 'Next', 'Someday'] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const PROJECT_TYPES = ['App', 'Animation', 'Comic', 'Screenplay', 'Other', 'Short Film'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'Not started': 'bg-gray-100 text-gray-800',
  'On hold': 'bg-red-100 text-red-800',
  'In progress': 'bg-blue-100 text-blue-800',
  'Done': 'bg-green-100 text-green-800',
};

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  'Now': 'bg-red-500',
  'Next': 'bg-yellow-500',
  'Someday': 'bg-blue-500',
};

export const TYPE_COLORS: Record<ProjectType, string> = {
  'App': 'bg-gray-100 text-gray-800',
  'Animation': 'bg-purple-100 text-purple-800',
  'Comic': 'bg-orange-100 text-orange-800',
  'Screenplay': 'bg-green-100 text-green-800',
  'Other': 'bg-red-100 text-red-800',
  'Short Film': 'bg-blue-100 text-blue-800',
};
