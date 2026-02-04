export const PROJECT_STATUSES = ['Not started', 'On hold', 'In progress', 'Done'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ['Now', 'Next', 'Someday'] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

// Default project types - users can add custom types
export const DEFAULT_PROJECT_TYPES = ['App', 'Animation', 'Comic', 'Screenplay', 'Other', 'Short Film'] as const;

// ProjectType is now a string to allow custom types
export type ProjectType = string;

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'Not started': 'bg-gray-100 text-gray-800',
  'On hold': 'bg-red-100 text-red-800',
  'In progress': 'bg-blue-100 text-blue-800',
  'Done': 'bg-green-100 text-green-800',
};

// Stoplight dot colors for status indicators
export const STATUS_DOT_COLORS: Record<ProjectStatus, string> = {
  'Not started': 'bg-gray-400',
  'On hold': 'bg-red-500',
  'In progress': 'bg-yellow-500',
  'Done': 'bg-green-500',
};

export const PRIORITY_COLORS: Record<ProjectPriority, string> = {
  'Now': 'bg-red-500',
  'Next': 'bg-yellow-500',
  'Someday': 'bg-blue-500',
};

// Known type colors for default types
const TYPE_COLOR_MAP: Record<string, string> = {
  'App': 'bg-gray-100 text-gray-800',
  'Animation': 'bg-purple-100 text-purple-800',
  'Comic': 'bg-orange-100 text-orange-800',
  'Screenplay': 'bg-green-100 text-green-800',
  'Other': 'bg-red-100 text-red-800',
  'Short Film': 'bg-blue-100 text-blue-800',
};

// Default color for custom types
const DEFAULT_TYPE_COLOR = 'bg-slate-100 text-slate-800';

// Function to get color for any type (handles custom types)
export function getTypeColor(type: string): string {
  return TYPE_COLOR_MAP[type] || DEFAULT_TYPE_COLOR;
}

// Keeping TYPE_COLORS for backward compatibility, but prefer getTypeColor
export const TYPE_COLORS: Record<string, string> = TYPE_COLOR_MAP;
