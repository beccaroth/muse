import { Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

export function AppShell() {
  useTheme();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
