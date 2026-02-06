import { Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/stores/authStore';
import { Loading } from '@/components/ui/loading';

export function AppShell() {
  useTheme();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Loading className="py-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
      <Toaster position="bottom-right" />
    </div>
  );
}

export function AuthenticatedLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
