import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Palette, Monitor, Moon, Sun, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewStore } from "@/stores/viewStore";
import { useTheme } from "@/hooks/useTheme";
import { AddNewModal } from "./AddNewModal";
import { CommandPalette } from "./CommandPalette";

export function Header() {
  const { setAddNewOpen } = useViewStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const auth = useAuth();

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Palette className="h-6 w-6 text-primary" />
          <span className="spark-text">Museboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <CommandPalette />
          {/* Mobile: Plus button to add new project or seed */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setAddNewOpen(true)}
            aria-label="Add new"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Theme">
                {theme === "system" && <Monitor className="h-4 w-4" />}
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as typeof theme)}
              >
                <DropdownMenuRadioItem value="system">
                  <Monitor className="h-4 w-4" />
                  System
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await auth.logout();
              await router.invalidate();
              await navigate({ to: "/login" });
            }}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AddNewModal />
    </header>
  );
}
