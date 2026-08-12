# Museboard

Personal creative projects dashboard for organizing ideas and tracking progress. Single-user app with Supabase Auth.

## Tech Stack

- **Framework:** React 19 + TypeScript 5.9 + Vite 7
- **Routing:** TanStack Router v1 (type-safe; route tree defined in code in `src/router.tsx`, not file-based)
- **Server state:** TanStack Query v5 (query keys: `['projects']`, `['projects', id]`, `['seeds']`)
- **UI state:** Zustand (view preferences, modals in `src/stores/viewStore.ts`), React Context (auth)
- **UI:** shadcn/ui (New York style) + Radix UI + Tailwind CSS v4 + Lucide icons
- **Rich text:** Tiptap v3 (ProseMirror-based)
- **Forms:** React Hook Form + Zod v4 + @hookform/resolvers
- **Drag & drop:** dnd-kit
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Toasts:** Sonner

## Commands

```
npm run dev       # Start Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── auth/          # LoginPage
│   ├── layout/        # RootLayout, Dashboard, Header, AddNewModal
│   ├── projects/      # ProjectForm, ProjectPage, ProjectKanban, ProjectTable
│   ├── seeds/         # Seed management (inbox for ideas)
│   ├── tiptap-*/      # Rich text editor UI, extensions, templates
│   └── ui/            # shadcn/ui primitives (added via `npx shadcn@latest add`)
├── hooks/             # TanStack Query wrappers (useProjects, useSeeds) + utility hooks
├── stores/            # authStore (Context), viewStore + themeStore (Zustand)
├── lib/               # supabase client, constants, utils (cn())
├── types/             # TypeScript interfaces (Project, Seed, Task)
├── router.tsx         # Route tree and auth guards
└── main.tsx           # Entry point with providers
```

## Routing

TanStack Router with auth guards via `beforeLoad()`. Routes are declared with
`createRoute()` in `src/router.tsx` — there is no file-based routing or codegen step.

- `/login` — public, redirects to `/` if already authenticated
- `/` — Dashboard (projects + seeds sections)
- `/project/$projectId` — Project detail page with notes editor
- `/tasks` — Tasks across all projects

Auth context is passed to the router via `RouterProvider`. Unauthenticated access
redirects to `/login?redirect=<original-url>`; the redirect target is validated as a
same-origin path before being followed. Call `router.invalidate()` after login or logout
so `beforeLoad` guards re-run against the new auth state.

Route components are lazy (`lazyRouteComponent`) and preloaded on intent, so hovering a
link fetches the chunk before the click. Read params with
`getRouteApi('<routeId>').useParams()` rather than `useParams({ strict: false })`, which
returns loosely-typed values.

This is a client-rendered SPA: `vercel.json` rewrites unmatched paths to `/index.html` so
deep links and refreshes resolve. Removing that rewrite makes every route except `/`
return a 404 on direct navigation.

## Database

Supabase with migrations in `supabase/migrations/` (numbered SQL files). Tables:

- **projects** — id, project_name, icon, status (enum), priority (enum), project_types (text[]), description, notes (HTML), progress (0-100), start_date, end_date
- **seeds** — id, title, icon, description, project_type, date_added
- **tasks** — id, project_id (FK), title, completed, sort_order (future feature)

Status enum: `'Not started' | 'On hold' | 'In progress' | 'Done'`
Priority enum: `'Now' | 'Next' | 'Someday'`

RLS enabled on all tables. Policies currently allow all authenticated users.

## Key Patterns

- **Data hooks** return TanStack Query mutations with optimistic updates and cache invalidation
- **Undo pattern:** `useDeleteProjectWithUndo`, `usePromoteSeedWithUndo` — optimistic update + 5s undo toast
- **shadcn components:** Always add via `npx shadcn@latest add <component>`, never create manually
- **Tailwind v4:** Uses `@plugin "@tailwindcss/typography"` syntax, oklch color variables
- **Tiptap:** Memoize the `extensions` array with `useMemo` to prevent infinite re-render loops. Use `immediatelyRender: false` for SSR/strict-mode.
- **Import aliases:** `@/components`, `@/hooks`, `@/lib`, `@/stores`, `@/types`

## Environment Variables

```
VITE_SUPABASE_URL=<supabase project url>
VITE_SUPABASE_ANON_KEY=<supabase anon key>
```
