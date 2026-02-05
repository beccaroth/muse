import { createRouter, createRoute, createRootRouteWithContext, redirect } from '@tanstack/react-router';
import { Dashboard } from '@/components/layout/Dashboard';
import { AppShell, AuthenticatedLayout } from '@/components/layout/RootLayout';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { LoginPage } from '@/components/auth/LoginPage';
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
  component: LoginPage,
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
  component: Dashboard,
});

// Project detail route
const projectRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/project/$projectId',
  component: ProjectPage,
});

// Route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([indexRoute, projectRoute]),
]);

// Create router
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,  // Will be set by RouterProvider in main.tsx
  },
});

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
