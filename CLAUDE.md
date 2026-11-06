# Museboard

Personal creative projects dashboard for organizing ideas and tracking progress. Single-user app with Neon Auth.

## Tech Stack

- **Framework:** React 19 + TypeScript 5.9 + Vite 7
- **Routing:** TanStack Router v1 (type-safe; route tree defined in code in `src/router.tsx`, not file-based)
- **Server state:** TanStack Query v5 (query keys: `['projects']`, `['projects', id]`, `['seeds']`)
- **UI state:** Zustand (view preferences, modals in `src/stores/viewStore.ts`), React Context (auth)
- **UI:** shadcn/ui (New York style) + Radix UI + Tailwind CSS v4 + Lucide icons
- **Rich text:** Tiptap v3 (ProseMirror-based)
- **Forms:** React Hook Form + Zod v4 + @hookform/resolvers
- **Drag & drop:** dnd-kit
- **Database:** Neon (PostgreSQL) with Row Level Security; queried from the browser via the Neon Data API (PostgREST-compatible) using `@neondatabase/neon-js`
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
├── lib/               # Neon client (db.ts), constants, utils (cn())
├── types/             # TypeScript interfaces (Project, Seed, Task)
├── router.tsx         # Route tree and auth guards
└── main.tsx           # Entry point with providers
```

## Routing

TanStack Router with auth guards via `beforeLoad()`. Routes are declared with
`createRoute()` in `src/router.tsx` — there is no file-based routing or codegen step.

- `/login` — public, redirects to `/` if already authenticated
- `/reset-password` — public, landing page for the emailed password-reset link
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

Neon (project `museboard`, branch `main`, database `neondb`) with migrations in
`db/migrations/` (numbered SQL files, applied manually — e.g. with the Neon SQL editor or
`psql`). Neon Auth and the Data API must be enabled before the first migration, which
references their `authenticated`/`anonymous` roles and `auth.user_id()`. Tables:

- **projects** — id, project_name, icon, status (enum), priority (enum), project_types (text[]), description, notes (HTML), progress (0-100), start_date, end_date
- **seeds** — id, title, icon, description, project_type, date_added, status ('active' | 'archived')
- **tasks** — id, project_id (FK), title, completed, sort_order, due_date

Status enum: `'Not started' | 'On hold' | 'In progress' | 'Done'`
Priority enum: `'Now' | 'Next' | 'Someday'`

RLS enabled on all tables. Policies allow only the owner's Neon Auth user ID (hardcoded in
`db/migrations/001_schema.sql`), not every signed-in user: Neon Auth's shared Google
sign-in can create users even with email sign-up disabled. `anonymous` has no grants.

## Auth

`src/lib/db.ts` creates the Neon client with `SupabaseAuthAdapter`, which keeps the
supabase-js auth API (`signInWithPassword`, `getSession`, `onAuthStateChange`,
`signOut`) used by `src/stores/authStore.tsx`. Email sign-up is disabled; accounts are
created in the Neon console. Passwords are set via the emailed reset link
("Forgot password?" on `/login` → `/reset-password`). The app's production origin must be
a trusted domain in Neon Auth for the reset redirect to be accepted.

## Key Patterns

- **Data hooks** return TanStack Query mutations with optimistic updates and cache invalidation
- **Undo pattern:** `useDeleteProjectWithUndo`, `usePromoteSeedWithUndo` — optimistic update + 5s undo toast
- **shadcn components:** Always add via `npx shadcn@latest add <component>`, never create manually
- **Tailwind v4:** Uses `@plugin "@tailwindcss/typography"` syntax, oklch color variables
- **Tiptap:** Memoize the `extensions` array with `useMemo` to prevent infinite re-render loops. Use `immediatelyRender: false` for SSR/strict-mode.
- **Import aliases:** `@/components`, `@/hooks`, `@/lib`, `@/stores`, `@/types`

## Environment Variables

```
VITE_NEON_AUTH_URL=<Neon Auth URL>
VITE_NEON_DATA_API_URL=<Neon Data API URL>
```
