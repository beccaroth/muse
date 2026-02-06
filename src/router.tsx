import { createRouter, createRoute, createRootRouteWithContext, redirect, lazyRouteComponent, createHashHistory } from '@tanstack/react-router';
import { AppShell, AuthenticatedLayout } from '@/components/layout/RootLayout';
import { Loading } from '@/components/ui/loading';
import type { AuthContext } from '@/stores/authStore';

interface RouterContext {
  auth: AuthContext;
}

// Root route — auth context is provided via RouterProvider
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: AppShell,
});

// Login route — accessible only when not authenticated
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: lazyRouteComponent(
    () => import('@/components/auth/LoginPage'),
    'LoginPage',
  ),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

// Authenticated layout route — protects all child routes
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
});

// Index route (dashboard)
const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: lazyRouteComponent(
    () => import('@/components/layout/Dashboard'),
    'Dashboard',
  ),
});

// Project detail route
const projectRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/project/$projectId',
  component: lazyRouteComponent(
    () => import('@/components/projects/ProjectPage'),
    'ProjectPage',
  ),
});

// Route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([indexRoute, projectRoute]),
]);

// Use hash history in Electron (file:// protocol can't do path-based routing)
const isElectron = window.location.protocol === 'file:';
const hashHistory = createHashHistory();

// Create router
export const router = createRouter({
  routeTree,
  history: isElectron ? hashHistory : undefined,
  context: {
    auth: undefined!,  // Will be set by RouterProvider in main.tsx
  },
  defaultPendingComponent: () => <Loading className="py-20" />,
  defaultPendingMs: 500,
  defaultPendingMinMs: 300,
});

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
