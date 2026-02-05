import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { Dashboard } from '@/components/layout/Dashboard';
import { ProjectPage } from '@/components/projects/ProjectPage';

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" />
    </>
  ),
});

// Index route (dashboard)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

// Project detail route
const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project/$projectId',
  component: ProjectPage,
});

// Route tree
const routeTree = rootRoute.addChildren([indexRoute, projectRoute]);

// Create router
export const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
