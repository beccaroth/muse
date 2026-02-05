import { Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/hooks/useTheme';

export function RootLayout() {
  useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Outlet />
      <Toaster position="bottom-right" />
    </div>
  );
}
