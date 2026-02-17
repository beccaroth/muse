import { useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Palette,
  Monitor,
  Moon,
  Sun,
  Plus,
  LogOut,
  Menu,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useViewStore } from "@/stores/viewStore";
import { useTheme } from "@/hooks/useTheme";
import { AddNewModal } from "./AddNewModal";
import { CommandPalette } from "./CommandPalette";

function MobileNav() {
  const [open, setOpen] = useState(false);
  const { setAddNewOpen } = useViewStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const auth = useAuth();

  const navLinkClass =
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-accent-foreground hover:bg-accent [&.active]:bg-accent [&.active]:text-accent-foreground";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <span className="spark-text">Museboard</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          <SheetClose asChild>
            <Link to="/" activeOptions={{ exact: true }} className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/tasks" className={navLinkClass}>
              <CheckSquare className="h-4 w-4" />
              Tasks
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/calendar" className={navLinkClass}>
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Link>
          </SheetClose>
        </nav>
        <div className="border-t mx-2 my-2" />
        <div className="flex flex-col gap-1 px-2">
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-accent-foreground hover:bg-accent w-full text-left"
            onClick={() => {
              setOpen(false);
              setAddNewOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add new
          </button>
        </div>
        <div className="border-t mx-2 my-2" />
        <div className="flex flex-col gap-2 px-5">
          <p className="text-xs font-medium text-muted-foreground">Theme</p>
          <div className="flex rounded-lg bg-muted p-1">
            {([
              { value: "system" as const, icon: Monitor, label: "System" },
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
            ]).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  theme === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setTheme(value)}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto border-t mx-2 pt-2">
          <button
            className="flex items-center gap-3 px-5 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-accent-foreground hover:bg-accent w-full text-left"
            onClick={async () => {
              setOpen(false);
              await auth.logout();
              await router.invalidate();
              await navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const auth = useAuth();

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <MobileNav />
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 text-xl sm:text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Palette className="h-6 w-6 text-primary" />
            <span className="spark-text">Museboard</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Tasks
            </Link>
            <Link
              to="/calendar"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Calendar
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <CommandPalette />
          <div className="hidden sm:flex items-center gap-2">
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
      </div>
      <AddNewModal />
    </header>
  );
}
